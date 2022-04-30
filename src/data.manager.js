import fs from "fs";
import path from "path";

const __dirname = path.resolve(path.dirname(''));


function saveData(guildsData) {
  const data = JSON.stringify(Object.fromEntries(guildsData));
  fs.writeFileSync(path.join(__dirname, "./data.json"), data, (error) => {
    if(error) {
      throw error;
    }
  })
  console.log('[INFO] Saved data to data.json');
}

function getData() {
  try {
    fs.readFile(path.join(__dirname,"./data.json"), 'utf-8', (error, data) => {
      if(error) {
        throw error;
      }

      const entries = Object.entries(JSON.parse(data));
      console.log(`[INFO] Recovered ${entries.length} guilds from data.json`)
      return new Map(entries);
    })
  } catch (error) {
    console.error(
      '[ERROR] Something went wrong trying to get data from data.json. Check if the file exists, for now the map will be empty.'
    )

    return {};
  }
}

export {
  saveData,
  getData
}
