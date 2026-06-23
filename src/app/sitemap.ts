import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";

const BASE = "https://planodesign.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const staticRoutes = ["", "/about", "/portfolio", "/consultant"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({
    url: `${BASE}/portfolio/${p.no}`,
    lastModified: new Date(),
  }));
  return [...staticRoutes, ...projectRoutes];
}
