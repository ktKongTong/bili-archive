import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ignoreDuringBuilds: true,
};

export default withContentCollections(config);
