/**
 * Page ownership types for feature mapping
 */

export interface PageOwner {
  username: string;
  githubId: string;
  avatarUrl?: string;
}

export interface Page {
  id: string;
  name: string;
  description?: string;
  owners: PageOwner[];
  createdAt: string;
  updatedAt: string;
}

export interface PagesConfig {
  pages: Page[];
}
