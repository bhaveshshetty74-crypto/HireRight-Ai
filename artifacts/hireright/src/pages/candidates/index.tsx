import { useListCandidates, useCreateCandidate, useDeleteCandidate, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Users, MapPin, Briefcase, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Current title is required"),
  experience: z.string().min(1, "Experience is required"),
  location: z.string().min(1, "Location is required"),
  source: z.string().min(1, "Source is required"),
  resume: z.string().min(1, "Resume text is required"),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

export default function Candidates() {
  const { data: candidates, isLoading } = useListCandidates();
  const deleteCandidate = useDeleteCandidate();
  const createCandidate = useCreateCandidate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      title: "",
      experience: "",
      location: "",
      source: "",
      resume: "",
    },
  });

  const onSubmit = (data: CandidateFormValues) => {
    createCandidate.mutate(
      { data: { ...data, stage: "New" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-2">Manage all candidates across your pipeline.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-candidate">
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} data-testid="input-candidate-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Current Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Frontend Developer" {...field} data-testid="input-candidate-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1 mt-0">
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 4 years" {...field} data-testid="input-candidate-experience" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1 mt-0">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} data-testid="input-candidate-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="LinkedIn, Referral, etc." {...field} data-testid="input-candidate-source" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Resume Text</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste resume content here for parsing..." 
                          className="min-h-[150px]"
                          {...field} 
                          data-testid="input-candidate-resume" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 flex justify-end pt-2">
                  <Button type="submit" disabled={createCandidate.isPending} data-testid="button-submit-candidate">
                    {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : candidates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No candidates found</h3>
          <p className="text-muted-foreground mt-1 mb-4">Add candidates to your pipeline to get started.</p>
          <Button onClick={() => setOpen(true)}>Add Candidate</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {candidates?.map((candidate) => (
            <Card key={candidate.id} className="hover:border-primary/50 transition-colors" data-testid={`card-candidate-${candidate.id}`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/candidates/${candidate.id}`} className="text-lg font-semibold hover:underline truncate">
                      {candidate.name}
                    </Link>
                    {candidate.shortlisted && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                    <Badge variant="outline" className="ml-2 bg-background">{candidate.stage}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <Briefcase className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[200px]">{candidate.title}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1.5">Source:</span> {candidate.source}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="secondary" size="sm" data-testid={`link-candidate-${candidate.id}`}>
                    <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this candidate?")) {
                        deleteCandidate.mutate({ id: candidate.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() })
                        });
                      }
                    }}
                    data-testid={`button-delete-candidate-${candidate.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
