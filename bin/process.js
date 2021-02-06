// const title = require('../data/titles.json');
// const plots = require('../data/plot_keywords.json');


// _.p("plots: ", plots);
// _.p("titles: ", titles);

const titles = require('../data/common_episode_names.json');

const fixed = [];

titles.forEach(function(row, i){
   let { count, title, notes } = row;
   count = count.trim();
   title_str = title.trim();
   notes = notes.trim();

   if(count === "# of Episodes"){ return; }

   count = count-0;

   let variants = [];
   const titles = title_str.split("/").map(function(t){
      t = t.trim();
      if(t[0] === '"'){ t = t.substr(1, t.length-1); }
      if(t[t.length-1] === '"'){ t = t.substr(0, t.length-1); }
      return(t);
   });
   title = titles.shift();

   // console.log(i, ": ", row);

   fixed.push({ count, title, variants: titles, notes });

});


console.log(JSON.stringify(fixed, null, 3));

// console.log("titles in: ", titles.length);
// console.log("titles out: ", fixed.length);
