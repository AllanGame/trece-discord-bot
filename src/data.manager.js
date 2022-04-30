import fs from "fs";
import path from "path";

const __dirname = path.resolve(path.dirname(''));

export function saveData(guildsData) {
  const data = JSON.stringify(Object.fromEntries(guildsData));
  fs.writeFileSync(path.join(__dirname, "./data.json"), data, (error) => {
    if(error) {
      throw error;
    }
  })
  console.log('[INFO] Saved data to data.json');
}
