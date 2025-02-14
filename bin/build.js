
const fs = require('fs');
const path = require('path');

const _titles = require('../data/titles.json');
const _plots = require('../data/plot_keywords.json');


// var js = fs.writeFileSync("../lib/episode.js");

function generator(titles, plots){

   // returns a random number between min (inclusive) and max (exclusive)
   function random_int(min, max){
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
   }
   function random_index(a){ return random_int(0, a.length-1); }

   function sample(a, count){
      const indexes = [];

      for(let i = 0; i < count; i++){
         let index;
         do{
            index = random_index(a);
         }while(indexes.includes(index));
         indexes.push(index);
      }

      return(indexes);
   }

   function get_episode(indexes){
      const title_index = indexes[0];
      if(title_index >= titles.length){ throw(new Error("index outside of title bounds.")); }

      return({
         title: titles[title_index],
         plots: indexes[1].map(function(plot){
            return plot.map(function(i){
               if(i >= plots.length){ throw(new Error("index outside of keyword bounds.")); }
               return plots[i]
            });
         }),
         indexes
      });
   }

   function random_episode(n_plots, n_keywords){

      const p = [];

      for(let i = 0; i < n_plots; i++){
         p.push(sample(plots, n_keywords));
      }

      const indexes = [ sample(titles, 1)[0], p ];

      const episode = get_episode(indexes);

      return(episode);
   }

   random_episode.get = get_episode;
   random_episode.random = random_episode;
   random_episode.titles = titles;
   random_episode.keywords = plots;

   return random_episode;
}

function check_titles(){
   for(let i = 0; i < _titles.length; i++){
      if(_titles[i].title.match(/[^a-zA-Z ',?._!]/)){
         console.log(_titles[i]);
      }
   }
}

console.dir(generator(_titles, _plots)(2, 5));

const web_lib = `window.plots = (function(){
   return (${generator.toString()})(${JSON.stringify(_titles)}, ${JSON.stringify(_plots)});
})()`;

const node_lib = `module.exports = (function(){
   return (${generator.toString()})(${JSON.stringify(_titles)}, ${JSON.stringify(_plots)});
})()`;

const this_dir = __dirname;

fs.writeFileSync(path.join(this_dir, "../build/plots.gen.node.js"), node_lib);
fs.writeFileSync(path.join(this_dir, "../build/plots.gen.web.js"), web_lib);


