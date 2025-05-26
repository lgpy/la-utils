'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type StoneState } from './types';
import { getColorClasses } from './utils';
import { type GoalCondition, type OptimalMoveResult, type GameState } from './calculator'; // StoneGameOptimizer removed
import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TargetOverviewCardProps {
  stoneState: StoneState | undefined;
  className?: string;
}

const goals: Record<string, GoalCondition[]> = {
  "77": [
    { r1MinSuccess: 7, r2MinSuccess: 7 },
    { r1MinSuccess: 9, r2MinSuccess: 6 },
    { r1MinSuccess: 6, r2MinSuccess: 9 },
  ],
  "96": [
    { r1MinSuccess: 9, r2MinSuccess: 6 },
    { r1MinSuccess: 6, r2MinSuccess: 9 },
  ],
  "97": [
    { r1MinSuccess: 9, r2MinSuccess: 7 },
    { r1MinSuccess: 7, r2MinSuccess: 9 },
    { r1MinSuccess: 10, r2MinSuccess: 6 },
    { r1MinSuccess: 6, r2MinSuccess: 10 },
  ]
}

export default function StoneStatus({ stoneState, className }: TargetOverviewCardProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const workerRef = useRef<Worker | null>(null);
  const [optimizerReady, setOptimizerReady] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    // Initialize the worker
    workerRef.current = new Worker(new URL('./stoneOptimizer.worker.ts', import.meta.url));
    console.log("Worker created");

    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, data, message, stack } = event.data;
      console.log("Main: Received message from worker", type, data);
      if (type === 'initDone') {
        setOptimizerReady(true);
        console.log("Main: Optimizer ready");
      } else if (type === 'optimalMove') {
        setOptimalMove(data);
        setCalculating(false);
        console.log("Main: Optimal move received", data);
      } else if (type === 'error') {
        console.error("Main: Worker error:", message, stack);
        setCalculating(false);
        // Optionally, notify the user of the error
      }
    };

    workerRef.current.onerror = (error) => {
      console.error("Main: Worker uncaught error:", error);
      setCalculating(false);
      // Optionally, notify the user of the error
    };

    return () => {
      // Terminate the worker when the component unmounts
      if (workerRef.current) {
        console.log("Terminating worker");
        workerRef.current.onmessage = null; // Remove onmessage handler
        workerRef.current.onerror = null;   // Remove onerror handler
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedGoal && goals[selectedGoal] && workerRef.current) {
      console.log("Main: Selected goal changed, initializing optimizer in worker", selectedGoal);
      setOptimizerReady(false); // Reset ready state
      setOptimalMove(null); // Clear previous optimal move
      workerRef.current.postMessage({
        type: 'init',
        payload: {
          goalConditions: goals[selectedGoal],
          maxRedundantRedFails: 5, // Or get this from somewhere
        },
      });
    } else if (!selectedGoal && workerRef.current) {
      // If no goal is selected, ensure optimizer is not marked as ready
      setOptimizerReady(false);
      setOptimalMove(null);
    }
  }, [selectedGoal]);


  const [optimalMove, setOptimalMove] = useState<OptimalMoveResult | null>(null);

  useEffect(() => {
    if (stoneState && optimizerReady && workerRef.current && !calculating) {
      console.log("Main: Stone state or optimizer readiness changed, calculating optimal move in worker", stoneState);
      console.log(stoneState, optimizerReady);
      setCalculating(true);
      workerRef.current.postMessage({
        type: 'getOptimalMove',
        payload: { gameState: stoneState as GameState },
      });
    } else if (!stoneState) {
      setOptimalMove(null); // Clear optimal move if stoneState is undefined
    }
  }, [stoneState, optimizerReady]);


  return (
    <Card className={cn(className)}>
      <CardHeader><CardTitle>Stone state</CardTitle></CardHeader>
      <CardContent>
        {stoneState === undefined ? (
          <div className="text-gray-500">No stone state available</div>
        ) : (<>
          <div className="flex justify-between items-end mb-4 ">
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Stone Goal" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(goals).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key} or better
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              {selectedGoal && !optimizerReady && <span className="text-sm text-gray-400 mr-2">Loading model...</span>}
              {optimizerReady && calculating && <span className="text-sm text-gray-400 mr-2">Calculating optimal move...</span>}
            </div>
            <div>
              Success rate <span className="text-yellow">{stoneState?.percentage}%</span>
            </div>
          </div>
          <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_minmax(65px,1fr)] items-center justify-center text-center gap-2">
            {stoneState?.line1.map((cell, index) => (
              <div key={'line1-' + index}
                className={cn(
                  "w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
                  getColorClasses(cell, true).background
                )}
              />
            ))}
            <div>
              {optimalMove?.rowDecisionProbabilities?.[0] && (
                <span className={
                  cn(
                    "text-sm",
                    { "text-red": Math.max(...optimalMove.rowDecisionProbabilities) === optimalMove.rowDecisionProbabilities[0] && optimalMove.rowDecisionProbabilities[0] > 0 }
                  )
                }>
                  {optimalMove.rowDecisionProbabilities[0] === -1 ? "0%" : (
                    Number((optimalMove.rowDecisionProbabilities[0] * 100).toFixed(2)) + "%"
                  )}
                </span>
              )}
            </div>
            {stoneState?.line2.map((cell, index) => (
              <div key={'line2-' + index}
                className={cn(
                  "w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
                  getColorClasses(cell, true).background
                )}
              />
            ))}
            <div>
              {optimalMove?.rowDecisionProbabilities?.[1] && (
                <span className={
                  cn(
                    "text-sm",
                    { "text-red": Math.max(...optimalMove.rowDecisionProbabilities) === optimalMove.rowDecisionProbabilities[1] && optimalMove.rowDecisionProbabilities[1] > 0 }
                  )
                }>
                  {optimalMove.rowDecisionProbabilities[1] === -1 ? "0%" : (
                    Number((optimalMove.rowDecisionProbabilities[1] * 100).toFixed(2)) + "%"
                  )}
                </span>
              )}
            </div>
            {stoneState?.line3.map((cell, index) => (
              <div key={'line3-' + index}
                className={cn(
                  "w-6 h-6 transform rotate-45 m-1.5 border-2 border-neutral-700 shadow-md",
                  getColorClasses(cell, false).background
                )}
              />
            ))}
            <div>
              {optimalMove?.rowDecisionProbabilities?.[2] !== undefined && (
                <span className={
                  cn(
                    "text-sm",
                    { "text-red": Math.max(...optimalMove.rowDecisionProbabilities) === optimalMove.rowDecisionProbabilities[2] && optimalMove.rowDecisionProbabilities[2] > 0 }
                  )
                }>
                  {optimalMove.rowDecisionProbabilities[2] === -1 ? "0%" : (
                    Number((optimalMove.rowDecisionProbabilities[2] * 100).toFixed(2)) + "%"
                  )}
                </span>
              )}
            </div>
          </div>
        </>)}
      </CardContent>
    </Card >
  );
}
