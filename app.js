import fs from "fs";
import readline from "readline";

async function compile_election_results(filename) {
  const voters = new Set(); // Keep track of voters to make sure there is no fraud
  const results_count = new Map(); // Keep track of the candidates with their vote count

  try {
    // Read election result from text file
    const file = readline.createInterface({
      input: fs.createReadStream(filename),
      output: process.stdout,
      terminal: false,
    });

    file.on("line", (line) => {
      const line_split = line.split(", ");
      const voter_id = line_split[0];
      const candidate_id = line_split[1];

      // Check for fraud
      if (voters.has(voter_id)) {
        // Flag the voter as fraud, do not count additional votes from this voter
        console.log(
          `Voter ${voter_id} has already voted. Additional votes from this voter will not count.`
        );
      } else {
        voters.add(voter_id);

        const current_count = results_count[candidate_id] || 0;
        results_count[candidate_id] = current_count + 1;
      }
    });

    file.on("close", () => {
      console.log(
        "The candidates with the most amount of votes are: ",
        get_best_candidates(results_count)
      );
    });
  } catch (error) {
    console.error("Error reading the file.");
  }
}

function get_best_candidates(results_count) {
  const candidates = Object.entries(results_count).map(
    ([candidate_id, count]) => ({
      candidate_id,
      count,
    })
  );
  candidates.sort((a, b) => b.count - a.count);
  return candidates.slice(0, 3).map((candidate) => candidate.candidate_id);
}

compile_election_results("./election_results.txt");
