function runSS(people) {
  // minimum number of people in a Secret Santa is 2
  if (people.length < 2) {
    console.error('You must have two or more people for a Secret Santa draw');
  }

  const picks = {};
  // pick until we have a satisfactory outcome
  do {
    // the final array of picks

    // the list of present receivers left
    const receivers = JSON.parse(JSON.stringify(people));

    // loop through each person
    for (const i in people) {
      // get the sender's name
      const name = people[i];
      let rec = null;

      // find a receiver
      do {
        // check for infinite loop - i.e. only one person left to pick who is both sender & receiver
        if (receivers.length === 1 && receivers[0] === name) {
          break;
        }

        // pick a receiver at random from the list
        const sortInd = Math.floor(Math.random() * receivers.length);

        // a sender can't give a present to themselves
        if (name !== receivers[sortInd]) {
          rec = receivers[sortInd];
          receivers.splice(sortInd, 1);
        }
      } while (rec === null);

      // we have a match
      if (rec !== null) {
        picks[name] = rec;
      }
    }
  } while (Object.keys(picks).length < people.length); // until we have a full list of picks

  return picks;
}

module.exports = runSS;
