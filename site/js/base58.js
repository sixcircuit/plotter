
function make_base58(any_base){

   // TODO: this only supports the utf16 char set.
   // you need to make it 4 bytes to support the whole thing.

   const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
   const _bytes_per_char = 2;
   const _hex_per_char = _bytes_per_char * 2;

   const encode = {};
   const decode = {};

   encode.hex = any_base(any_base.HEX, alphabet);
   decode.hex = any_base(alphabet, any_base.HEX);

   const int_json_alphabet = ",1234567890[]";
   encode.int_json_array = any_base(int_json_alphabet, alphabet);
   decode.int_json_array = any_base(alphabet, int_json_alphabet);

   encode.int_array = function(ary){
      return encode.int_json_array(JSON.stringify(ary));
   }
      
   decode.int_array = function(base58){
      return JSON.parse(decode.int_json_array(base58));
   };

   encode.obj = function(obj){
      return encode.string(JSON.stringify(obj));
   };

   decode.obj = function(base58){
      return JSON.parse(decode.string(base58));
   };

   encode.string = function(str){
      const hex = string_to_hex(str);
      const base58 = encode.hex(hex);
      console.log("str.str: ", str);
      console.log("str.hex: ", hex);
      console.log("str.base58: ", base58);
      return(base58);
   };

   decode.string = function(base58){
      let hex = decode.hex(base58)
      let need_pad = _hex_per_char-(hex.length % _hex_per_char);
      hex = "0".repeat(need_pad) + hex;
      const str = hex_to_string(hex);
      console.log("str.base58: ", base58);
      console.log("str.hex: ", hex);
      console.log("str.str: ", str);
      return(str);
   };

   encode.array = function(a, bytes){

      const hex = string_to_hex(str);
      const base58 = encode.hex(hex);
      console.log("str.str: ", str);
      console.log("str.hex: ", hex);
      console.log("str.base58: ", base58);
      return(base58);
   };

   function string_to_hex(str){
      let result = "";

      for(let i = 0; i < str.length; i++){
         const hex = str.charCodeAt(i).toString(16);
         result += ("000"+hex).slice(-4);
         // result += ("0000" + "000" +hex).slice(-8);
      }
      return result
   }

   function hex_to_string(hex){
      const hexes = hex.match(/.{1,4}/g) || [];
      let str = "";
      for(let i = 0; i < hexes.length; i++){
         str += String.fromCharCode(parseInt(hexes[i], 16));
      }
      return str;
   }

   return({ encode, decode });
}

window.base58 = make_base58(window.AnyBase);

delete window.AnyBase;

