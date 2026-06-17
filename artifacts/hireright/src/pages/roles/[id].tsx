import { useGetRole, useListCandidates, useListScreenings, getGetRoleQueryKey, getListCandidatesQueryKey, getListScreeningsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, FileCode2, Users, Star, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function RoleDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: role, isLoading: isLoadingRole } = useGetRole(id, {
    query: { enabled: !!id, queryKey: getGetRoleQueryKey(id) }
  });

  const { data: candidates, isLoading: isLoadingCandidates } = useListCandidates(
    { roleId: id },
    { query: { enabled: !!id, queryKey: getListCandidatesQueryKey({ roleId: id }) } }
  );

  const { data: screenings, isLoading: isLoadingScreenings } = useListScreenings(
    { roleId: id },
    { query: { enabled: !!id, queryKey: getListScreeningsQueryKey({ roleId: id }) } }
  );

  if (isLoadingRole) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-4 mb-2 text-muted-foreground">
        <Link href="/roles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Roles
        </Link>
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{role.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-muted-foreground">
            {role.company && (
              <div className="flex items-center">
                <Building2 className="mr-1.5 h-4 w-4" />
                {role.company}
              </div>
            )}
            {role.experience && (
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-4 w-4" />
                {role.experience}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="screenings">Screenings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <FileCode2 className="mr-3 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {role.skills || "No skills specified"}
                </p>
              </div>
              
              {role.skillTags && role.skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {role.skillTags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {role.jdSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Description Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{role.jdSummary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="candidates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCandidates ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : candidates && candidates.length > 0 ? (
                <div className="space-y-4">
                  {candidates.map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Link href={`/candidates/${candidate.id}`} className="hover:underline">{candidate.name}</Link>
                          {candidate.shortlisted && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{candidate.title}</div>
                      </div>
                      <Badge variant="outline">{candidate.stage}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No candidates assigned to this role yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Screening Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingScreenings ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : screenings && screenings.length > 0 ? (
                <div className="space-y-4">
                  {screenings.map(screening => (
                    <div key={screening.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-card">
                      <div>
                        <div className="font-medium">{screening.candidateName ?? `Candidate #${screening.candidateId}`}</div>
                        <div className="text-sm text-muted-foreground mt-1">Score: {screening.score}/100</div>
                      </div>
                      <Badge className={
                        screening.verdict.toLowerCase().includes('yes') ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20' : 
                        screening.verdict.toLowerCase().includes('no') ? 'bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20'
                      }>
                        {screening.verdict}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  <p>No screenings completed for this role.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
