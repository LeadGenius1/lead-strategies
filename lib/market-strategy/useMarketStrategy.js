'use client';

import { useState, useCallback, useRef } from 'react';
import { createJob, getJobStatus, retryJob, cancelJob, openSSEStream } from './api';
import { ALL_AGENT_IDS, AGENT_STATUS, STAGES, STAGE_COUNT } from './constants';

/**
 * Build initial agent state map: { [agentId]: { status, progress, message, cached, costUsd, error } }
 */
function initAgentState() {
  const agents = {};
  for (const id of ALL_AGENT_IDS) {
    agents[id] = { status: AGENT_STATUS.PENDING, progress: 0, message: '', cached: false, costUsd: 0, error: null };
  }
  return agents;
}

/**
 * Build initial stage state map: { [stageIndex]: "pending" | "running" | "completed" }
 */
function initStageState() {
  const stages = {};
  for (let i = 0; i < STAGE_COUNT; i++) stages[i] = 'pending';
  return stages;
}

/**
 * Derive current phase from job events.
 * idle → form visible
 * thinking → job_start through stage 1 complete
 * building → stage 2+
 * results → job_complete
 */
function derivePhase(stages, jobComplete) {
  if (jobComplete) return 'results';
  const s0 = stages[0];
  const s1 = stages[1];
  if (s0 === 'running' || s1 === 'running' || s0 === 'pending') return 'thinking';
  // stages 0+1 completed, stages 2+ active
  if (s0 === 'completed' && s1 === 'completed') return 'building';
  return 'thinking';
}

/**
 * React hook managing the full Market Strategy job lifecycle.
 *
 * Returns:
 * { jobId, isRunning, isReconnecting, agents, stages, currentPhase,
 *   logs, stats, outputs, executeStrategy, retryFailed, cancel, reset }
 */
export function useMarketStrategy() {
  const [jobId, setJobId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [agents, setAgents] = useState(initAgentState);
  const [stages, setStages] = useState(initStageState);
  const [currentPhase, setCurrentPhase] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalCost: 0, cacheHits: 0, agentsCompleted: 0, agentsFailed: 0 });
  const [outputs, setOutputs] = useState(null);
  const [error, setError] = useState(null);

  const sseRef = useRef(null);
  const stagesRef = useRef(initStageState());
  const jobCompleteRef = useRef(false);

  const addLog = useCallback((entry) => {
    setLogs(prev => [...prev, { ts: new Date().toISOString(), ...entry }]);
  }, []);

  /**
   * Handle a single SSE event and update state accordingly.
   */
  const handleEvent = useCallback((event) => {
    if (event.type === 'sse_error') {
      setIsReconnecting(true);
      addLog({ type: 'sse_error', message: event.message });
      return;
    }

    setIsReconnecting(false);

    switch (event.type) {
      case 'job_start':
        addLog({ type: 'job_start', message: 'Pipeline started' });
        break;

      case 'stage_start':
        stagesRef.current = { ...stagesRef.current, [event.stageIndex]: 'running' };
        setStages({ ...stagesRef.current });
        setCurrentPhase(derivePhase(stagesRef.current, false));
        addLog({ type: 'stage_start', message: `Stage: ${event.label}`, stage: event.stage });
        break;

      case 'agent_start':
        setAgents(prev => ({
          ...prev,
          [event.agentId]: { ...prev[event.agentId], status: AGENT_STATUS.RUNNING, progress: 5, message: 'Starting...' },
        }));
        addLog({ type: 'agent_start', message: `${event.agentName || event.agentId} started`, agentId: event.agentId });
        break;

      case 'agent_progress':
        setAgents(prev => ({
          ...prev,
          [event.agentId]: {
            ...prev[event.agentId],
            progress: event.progress ?? prev[event.agentId]?.progress ?? 0,
            message: event.message || prev[event.agentId]?.message || '',
          },
        }));
        if (event.message) {
          addLog({ type: 'agent_progress', message: event.message, agentId: event.agentId, provider: event.provider });
        }
        break;

      case 'agent_complete':
        setAgents(prev => ({
          ...prev,
          [event.agentId]: {
            ...prev[event.agentId],
            status: AGENT_STATUS.COMPLETED,
            progress: 100,
            message: 'Complete',
            cached: event.cached || false,
            costUsd: event.costUsd || 0,
          },
        }));
        setStats(prev => ({
          ...prev,
          agentsCompleted: prev.agentsCompleted + 1,
          totalCost: prev.totalCost + (event.costUsd || 0),
          cacheHits: prev.cacheHits + (event.cached ? 1 : 0),
        }));

        // Check if all agents in a stage are complete
        for (const [idx, stageDef] of Object.entries(STAGES)) {
          const stageIdx = parseInt(idx, 10);
          if (stagesRef.current[stageIdx] === 'running') {
            // We need to check current agents state; use a setter callback
            setAgents(prev => {
              const allDone = stageDef.agents.every(id => {
                if (id === event.agentId) return true; // This agent just completed
                return prev[id]?.status === AGENT_STATUS.COMPLETED;
              });
              if (allDone) {
                stagesRef.current = { ...stagesRef.current, [stageIdx]: 'completed' };
                setStages({ ...stagesRef.current });
                setCurrentPhase(derivePhase(stagesRef.current, false));
              }
              return prev; // Don't change agents state in this setter
            });
          }
        }

        addLog({ type: 'agent_complete', message: `${event.agentId} completed`, agentId: event.agentId });
        break;

      case 'agent_failed':
        setAgents(prev => ({
          ...prev,
          [event.agentId]: {
            ...prev[event.agentId],
            status: AGENT_STATUS.FAILED,
            progress: 0,
            message: event.error || 'Failed',
            error: event.error,
          },
        }));
        setStats(prev => ({ ...prev, agentsFailed: prev.agentsFailed + 1 }));
        addLog({ type: 'agent_failed', message: `${event.agentId} failed: ${event.error}`, agentId: event.agentId });
        break;

      case 'job_complete': {
        jobCompleteRef.current = true;
        setCurrentPhase('results');
        setIsRunning(false);
        setStats(prev => ({ ...prev, totalCost: event.totalCostUsd ?? prev.totalCost }));
        addLog({ type: 'job_complete', message: `Pipeline ${event.status}`, status: event.status });

        // Fetch full outputs
        if (event.jobId || jobId) {
          getJobStatus(event.jobId || jobId)
            .then(data => { if (data.success) setOutputs(data); })
            .catch(() => {});
        }
        break;
      }
    }
  }, [addLog, jobId]);

  /**
   * Start a new market strategy run.
   */
  const executeStrategy = useCallback(async (input) => {
    try {
      setError(null);
      setIsRunning(true);
      setAgents(initAgentState());
      setStages(initStageState());
      stagesRef.current = initStageState();
      jobCompleteRef.current = false;
      setLogs([]);
      setStats({ totalCost: 0, cacheHits: 0, agentsCompleted: 0, agentsFailed: 0 });
      setOutputs(null);
      setCurrentPhase('thinking');

      const result = await createJob(input);
      if (!result.success) throw new Error(result.error || 'Failed to create job');

      setJobId(result.jobId);
      addLog({ type: 'system', message: `Job created: ${result.jobId}` });

      // Open SSE stream
      if (sseRef.current) sseRef.current.close();
      sseRef.current = openSSEStream(result.jobId, handleEvent);

    } catch (err) {
      setError(err.message);
      setIsRunning(false);
      setCurrentPhase('idle');
      addLog({ type: 'error', message: err.message });
    }
  }, [handleEvent, addLog]);

  /**
   * Retry failed agents on current job.
   */
  const retryFailed = useCallback(async () => {
    if (!jobId) return;
    try {
      setError(null);
      setIsRunning(true);
      jobCompleteRef.current = false;
      setCurrentPhase('thinking');

      // Reset failed agents to pending
      setAgents(prev => {
        const next = { ...prev };
        for (const id of ALL_AGENT_IDS) {
          if (next[id].status === AGENT_STATUS.FAILED) {
            next[id] = { ...next[id], status: AGENT_STATUS.PENDING, progress: 0, message: '', error: null };
          }
        }
        return next;
      });

      await retryJob(jobId);
      addLog({ type: 'system', message: 'Retry requested' });

      // Re-open SSE
      if (sseRef.current) sseRef.current.close();
      sseRef.current = openSSEStream(jobId, handleEvent);

    } catch (err) {
      setError(err.message);
      setIsRunning(false);
      addLog({ type: 'error', message: err.message });
    }
  }, [jobId, handleEvent, addLog]);

  /**
   * Cancel the current running job.
   */
  const cancelRun = useCallback(async () => {
    if (!jobId) return;
    try {
      if (sseRef.current) sseRef.current.close();
      await cancelJob(jobId);
      setIsRunning(false);
      setCurrentPhase('idle');
      addLog({ type: 'system', message: 'Job cancelled' });
    } catch (err) {
      addLog({ type: 'error', message: `Cancel failed: ${err.message}` });
    }
  }, [jobId, addLog]);

  /**
   * Reset to idle state for a new run.
   */
  const reset = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    setJobId(null);
    setIsRunning(false);
    setIsReconnecting(false);
    setAgents(initAgentState());
    setStages(initStageState());
    stagesRef.current = initStageState();
    jobCompleteRef.current = false;
    setCurrentPhase('idle');
    setLogs([]);
    setStats({ totalCost: 0, cacheHits: 0, agentsCompleted: 0, agentsFailed: 0 });
    setOutputs(null);
    setError(null);
  }, []);

  return {
    jobId,
    isRunning,
    isReconnecting,
    agents,
    stages,
    currentPhase,
    logs,
    stats,
    outputs,
    error,
    executeStrategy,
    retryFailed,
    cancel: cancelRun,
    reset,
  };
}
