import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTechnician } from "@/lib/technicians/actions";
import { toast } from "@/hooks/use-toast";

export const useCreateTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTechnician,
    onSuccess: (response) => {
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.statusText,
        });
        return;
      }
      
      // Invalidar las queries necesarias
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      
      toast({
        title: "¡Éxito!",
        description: response.statusText,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al crear el técnico. Por favor, intente nuevamente.",
      });
    },
  });
}; 