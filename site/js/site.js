

const _base58 = window.base58; delete window.base58;
const _plots = window.plots; delete window.plots;

const _keyword_count = { default: 8, min: 1, max: 25 };

const _storage = { get: {}, set: {} };
_storage.get.keyword_count = function(){ return getCookie("keyword_count") || _keyword_count.default; }
_storage.set.keyword_count = function(val){ return setCookie("keyword_count", val); }


function show_alert(title, message){
   let html = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
   `
   if(title){ html += `<strong>${title}</strong>`; }
   if(message){ html += `${message}`; }
   html += `</div>`;
   $(".center").prepend(html);
}

function get_plot(){

   let keyword_count = _storage.get.keyword_count();

   let plot = null;

   if(window.location.hash){
      try{
         let enc_json = window.location.hash.substr(1);
         let indexes = _base58.decode.int_array(enc_json);
         plot = _plots.get(indexes);
         keyword_count = plot.plots[0].length;
         console.log("indexes: ", indexes);
         console.log("plot: ", plot);
      }catch(e){
         show_alert("", "The link you used isn't formatted correctly. We'll show you something different.");
      }
   }

   if(!plot){ plot = _plots.random(3, keyword_count); }

   // test
   // while(plot.title.variants.length < 2){ plot = _plots.random(3, keyword_count); }
   // while(plot.title.title.length < 30){ plot = _plots.random(3, keyword_count); }

   _storage.set.keyword_count(keyword_count);

   return({ plot, keyword_count });
}

function make_link(plot){
   let link = window.location.origin + window.location.pathname; 
   link += "#" + _base58.encode.int_array(plot.indexes);
   return(link);
}

function plot_to_string(plot, index){
   const to = plot.title;
   const keywords = plot.plots[index];

   let title = to.title;
   if(to.variants.length){ title += ` (${ to.variants.join(", ") })`; }

   return `Title: ${title} Plot: ${keywords.join(", ")}`;
}

function is_small_screen(){ return(screen.width < 600); }

function render_plot(plot){

   const { title, plots } = plot;

   $(".title").text(title.title);

   if(title.variants.length){
      if(is_small_screen()){
         const html = title.variants.map(function(variant){
            return(variant + "<br/>");
         }).join("");
         $(".variants").html(html);
      }else{
         $(".variants").html(`(${title.variants.join(",&nbsp;")})`);
      }
      $(".variants").show();
   }else{
      $(".variants").hide();
   }

   let keyword_html = "";

   plots.forEach(function(plot, i){
      keyword_html += `<div class="keywords" data-index="${i}">`
      plot.forEach(function(keyword){
         keyword_html += `<h5 class="word">${keyword}</h5>`;
      });
      keyword_html += `<a class="copy">copy</a>`;
      keyword_html += `</div>`;
   });

   $(".keyword_container").html(keyword_html);

   $(".copy").click(function(e){
      e.preventDefault();

      const link = $(this);
      const index = link.parent().data("index");

      const str = plot_to_string(plot, index);

      console.log(str);

      copyToClipboard(str);

      link.text("copied")
      setTimeout(function(){ link.text("copy") }, 1000);

   });

   if('scrollRestoration' in history){
      history.scrollRestoration = 'manual';
   }

   $('body').scrollTop(0);
}

function render_footer(plot, keyword_count){

   const n_titles = _plots.titles.length
   const n_keywords = _plots.keywords.length;

   let numerator = BigInt(1);
   let denominator = BigInt(1);

   // http://www.flalottery.com/exptkt/pwrball-odds.pdf
   for(var i = 0; i < keyword_count; i++){
      numerator *= BigInt(n_keywords - i);
      denominator *= BigInt(i+1);
   }

   const odds = (numerator / denominator) * BigInt(n_titles);

   $(".n_titles").html(formatNumber(n_titles));
   $(".n_keywords").html(formatNumber(n_keywords));
   $(".odds").html(formatNumber(odds));
   $(".keywords_input").val(keyword_count);
}

function load_plot(){

   let override = false;
   
   const { plot, keyword_count } = get_plot();

   window.location.hash = "";
 
   $(".permalink").attr("href", make_link(plot));

   render_plot(plot);

   render_footer(plot, keyword_count);
}

function update_keyword_count(){
   let val = $(".keywords_input").val();

   if(!val){ return; }
   val = val - 0;

   if(isNaN(val)){ 
      $(".keywords_input").val(_storage.get.keyword_count());
   }else{
      val = Math.abs(val);
      val = Math.max(val, _keyword_count.min);
      val = Math.min(val, _keyword_count.max);
      _storage.set.keyword_count(val);
      window.location.hash = "";
      window.location.reload();
   }
}

$(function(){

   load_plot();

   let timeout = null;

   $(".keywords_input").keyup(function(){ 
      event.preventDefault();
      if(timeout){ clearTimeout(timeout); timeout = null; }
      if(event.which === 13){ return update_keyword_count(); }
      timeout = setTimeout(function(){ update_keyword_count(); }, 1000);
   });

});
