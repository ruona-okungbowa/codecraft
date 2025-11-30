import toast from "react-hot-toast";

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#10b981",
      color: "#fff",
      borderRadius: "8px",
      padding: "12px 16px",
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#ef4444",
      color: "#fff",
      borderRadius: "8px",
      padding: "12px 16px",
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      borderRadius: "8px",
      padding: "12px 16px",
    },
  });
};

export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    icon: "ℹ️",
    style: {
      background: "#4c96e1",
      color: "#fff",
      borderRadius: "8px",
      padding: "12px 16px",
    },
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const updateToast = (
  toastId: string,
  type: "success" | "error",
  message: string
) => {
  if (type === "success") {
    toast.success(message, { id: toastId });
  } else {
    toast.error(message, { id: toastId });
  }
};
