export interface Collaborator {
  name: string;
  email: string;
  role: "Viewer" | "Editor";
  userId: string;
}

export interface CollaboratorProps {
  name: string;
  email: string;
  role: "Viewer" | "Editor";
  onRoleChange: (newRole: "Viewer" | "Editor") => void;
  onRemove: () => void;
}
