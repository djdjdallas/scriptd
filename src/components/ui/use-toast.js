import { toast } from "sonner"

export const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant = "default",
      ...props
    }) => {
      if (variant === "destructive") {
        return toast.error(title, {
          description,
          ...props
        })
      }
      
      return toast(title, {
        description,
        ...props
      })
    },
    dismiss: (toastId) => toast.dismiss(toastId),
  }
}