import fs from "fs";
import path from "path";

import logger from "../../../config/logger";

export default async function handler(req, res) {
  const directoryPath = path.join(process.cwd(), "data");
  let files = [];

  try {
    files = fs
      .readdirSync(directoryPath)
      .filter((item) => item.includes("json"));
  } catch (e) {
    logger.error(e, "failed to load profiles");
  }

  const tags = files.flatMap((file) => {
    const filePath = path.join(directoryPath, file);
    try {
      const userTags = JSON.parse(fs.readFileSync(filePath, "utf8")).tags;
      return userTags && userTags.length ? userTags : [];
    } catch (e) {
      logger.warn(e, `failed to get load profile tags for: ${filePath}`);
      return [];
    }
  });

  const reducedTags = tags.reduce((allTags, name) => {
    const currCount = allTags[name] ?? 0;
    return {
      ...allTags,
      [name]: currCount + 1,
    };
  }, {});

  const tagsSorted = Object.entries(reducedTags)
    .map((item) => ({
      name: item[0],
      total: item[1],
    }))
    .sort((a, b) => b.total - a.total);

  res.status(200).json(tagsSorted);
}
