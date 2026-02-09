export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

export interface AuthContextValue {
  user: GitHubUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}
