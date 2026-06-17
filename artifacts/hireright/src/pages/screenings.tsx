import { useListScreenings } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileCheck, ChevronRight } from "lucide-react";

export default function Screenings() {
  const { data: screenings, isLoading } = useListScreenings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Screening Results</h1>
        <p className="text-muted-foreground mt-2">All AI-powered screening evaluations across your pipeline.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : screenings?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
          <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No screenings yet</h3>
          <p className="text-muted-foreground mt-1">Run a screening from a candidate's profile to see results here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {screenings?.map((screening) => (
            <Card key={screening.id} className="hover:border-primary/50 transition-colors flex flex-col" data-testid={`card-screening-${screening.id}`}>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Link href={`/candidates/${screening.candidateId}`} className="hover:underline text-primary">
                        {screening.candidateName ?? `Candidate #${screening.candidateId}`}
                      </Link>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/roles/${screening.roleId}`} className="hover:underline text-primary">
                        {screening.roleTitle ?? `Role #${screening.roleId}`}
                      </Link>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      Evaluated on {new Date(screening.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="text-sm px-2 py-1 ml-4 shadow-sm" variant={screening.score >= 80 ? "default" : screening.score >= 60 ? "secondary" : "destructive"}>
                    {screening.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="mb-4">
                  <Badge variant="outline" className={
                    screening.verdict.toLowerCase().includes('yes') ? 'bg-green-50 text-green-700 border-green-200' : 
                    screening.verdict.toLowerCase().includes('no') ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }>
                    Recommendation: {screening.verdict}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {screening.strengths && screening.strengths.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Top Strength</span>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{screening.strengths[0]}</p>
                    </div>
                  )}
                  {screening.concerns && screening.concerns.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Primary Concern</span>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{screening.concerns[0]}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
