import { useGetCandidate, useUpdateCandidate, useListScreenings, getGetCandidateQueryKey, getListScreeningsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Briefcase, Star, ArrowLeft, Clock, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function CandidateDetail() {
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const { data: candidate, isLoading: isLoadingCandidate } = useGetCandidate(id, {
    query: { enabled: !!id, queryKey: getGetCandidateQueryKey(id) }
  });

  const updateCandidate = useUpdateCandidate();

  const { data: screenings, isLoading: isLoadingScreenings } = useListScreenings(
    { candidateId: id },
    { query: { enabled: !!id, queryKey: getListScreeningsQueryKey({ candidateId: id }) } }
  );

  const toggleShortlist = () => {
    if (!candidate) return;
    updateCandidate.mutate(
      { id, data: { shortlisted: !candidate.shortlisted } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCandidateQueryKey(id) });
        }
      }
    );
  };

  if (isLoadingCandidate) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-16 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!candidate) {
    return <div>Candidate not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-4 mb-2 text-muted-foreground">
        <Link href="/candidates">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
            <Badge variant="outline" className="text-sm">{candidate.stage}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
            <div className="flex items-center">
              <Briefcase className="mr-1.5 h-4 w-4" />
              {candidate.title}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              {candidate.experience}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-1.5 h-4 w-4" />
              {candidate.location}
            </div>
          </div>
        </div>

        <Button 
          onClick={toggleShortlist} 
          variant={candidate.shortlisted ? "secondary" : "outline"}
          className={candidate.shortlisted ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200" : ""}
          data-testid="button-toggle-shortlist"
          disabled={updateCandidate.isPending}
        >
          <Star className={`mr-2 h-4 w-4 ${candidate.shortlisted ? "fill-yellow-500 text-yellow-500" : ""}`} />
          {candidate.shortlisted ? "Shortlisted" : "Add to Shortlist"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile">Profile & Resume</TabsTrigger>
          <TabsTrigger value="screenings">Screenings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                Resume Parsing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-md border font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {candidate.resume || "No resume data available."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Screening History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingScreenings ? (
                <div className="space-y-4">
                  {[1].map(i => <Skeleton key={i} className="h-32 w-full" />)}
                </div>
              ) : screenings && screenings.length > 0 ? (
                <div className="space-y-4">
                  {screenings.map(screening => (
                    <Card key={screening.id} className="bg-muted/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between mb-4 pb-4 border-b gap-4">
                          <div>
                            <div className="font-semibold text-lg">{screening.roleTitle ?? `Role #${screening.roleId}`}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Assessed on {new Date(screening.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end gap-2">
                            <Badge className="text-sm px-3 py-1">Score: {screening.score}/100</Badge>
                            <Badge variant="outline" className={
                              screening.verdict.toLowerCase().includes('yes') ? 'text-green-600 border-green-200' : 
                              screening.verdict.toLowerCase().includes('no') ? 'text-red-600 border-red-200' : 
                              'text-yellow-600 border-yellow-200'
                            }>
                              {screening.verdict}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2 flex items-center text-sm">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                              Key Strengths
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                              {screening.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-700 mb-2 flex items-center text-sm">
                              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                              Potential Concerns
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                              {screening.concerns.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        </div>
                        
                        {screening.assessmentQuestion && (
                          <div className="mt-6 pt-4 border-t">
                            <h4 className="font-medium mb-2 text-sm">Recommended Interview Question:</h4>
                            <p className="text-sm text-muted-foreground italic">"{screening.assessmentQuestion}"</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-card">
                  <p>This candidate has not been screened for any roles yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
