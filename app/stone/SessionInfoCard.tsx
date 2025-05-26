'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PixelTarget } from './types';

interface SessionInfoCardProps {
  mediaStreamActive: boolean;
  targets: PixelTarget[];
}

export default function SessionInfoCard({
  mediaStreamActive,
  targets,
}: SessionInfoCardProps) {
  const allTargetsMatch = targets.length > 0 && targets.every(t => t.isMatch);
  const targetsCount = targets.length;

  return (
    <Card>
      <CardHeader><CardTitle>Session Info</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          Screen Share: <Badge variant={mediaStreamActive ? 'default' : 'destructive'} className="ml-2">
            {mediaStreamActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {targetsCount > 0 && (
          <div className="mt-2">
            All Match: <Badge variant={allTargetsMatch ? 'default' : 'destructive'} className="ml-2">
              {allTargetsMatch ? 'YES' : 'NO'}
            </Badge>
          </div>
        )}
        {targetsCount > 0 && (
          <div className="mt-2">
            Targets: <Badge variant={'outline'} className="ml-2">{targetsCount}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
