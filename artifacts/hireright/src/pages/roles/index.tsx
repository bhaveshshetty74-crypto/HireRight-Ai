import { useListRoles, useCreateRole, useDeleteRole, getListRolesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Building2, Calendar, FileCode2, Briefcase } from "lucide-react";
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

const roleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function Roles() {
  const { data: roles, isLoading } = useListRoles();
  const deleteRole = useDeleteRole();
  const createRole = useCreateRole();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      title: "",
      company: "",
      experience: "",
      skills: "",
    },
  });

  const onSubmit = (data: RoleFormValues) => {
    createRole.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() });
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
          <h1 className="text-3xl font-bold tracking-tight">Open Roles</h1>
          <p className="text-muted-foreground mt-2">Manage your hiring pipeline for each role.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-role">
              <Plus className="mr-2 h-4 w-4" />
              New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Engineer" {...field} data-testid="input-role-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Corp - Engineering" {...field} data-testid="input-role-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Required</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5+ years" {...field} data-testid="input-role-experience" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Skills</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. React, TypeScript, Node.js" {...field} data-testid="input-role-skills" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createRole.isPending} data-testid="button-submit-role">
                    {createRole.isPending ? "Creating..." : "Create Role"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : roles?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-dashed">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No roles found</h3>
          <p className="text-muted-foreground mt-1 mb-4">Create your first role to start hiring.</p>
          <Button onClick={() => setOpen(true)}>Create Role</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.map((role) => (
            <Card key={role.id} className="flex flex-col hover:border-primary/50 transition-colors" data-testid={`card-role-${role.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{role.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive -mt-2 -mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Are you sure you want to delete this role?")) {
                        deleteRole.mutate({ id: role.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRolesQueryKey() })
                        });
                      }
                    }}
                    data-testid={`button-delete-role-${role.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1 gap-4">
                  {role.company && (
                    <div className="flex items-center">
                      <Building2 className="mr-1 h-3 w-3" />
                      {role.company}
                    </div>
                  )}
                  {role.experience && (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {role.experience}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-start text-sm">
                  <FileCode2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <p className="line-clamp-3 text-muted-foreground">{role.skills || "No skills specified"}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Button asChild variant="secondary" className="w-full" data-testid={`link-role-${role.id}`}>
                  <Link href={`/roles/${role.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
