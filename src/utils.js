function getScrollBarWidth() {
  var inner = document.createElement("p");
  inner.style.width = "100%";
  inner.style.height = "200px";

  var outer = document.createElement("div");
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);

  document.body.appendChild(outer);
  var w1 = inner.offsetWidth;
  outer.style.overflow = "scroll";
  var w2 = inner.offsetWidth;
  if (w1 === w2) w2 = outer.clientWidth;

  document.body.removeChild(outer);

  return w1 - w2;
}

export function scrollbarVisible(element) {
  return element.scrollHeight > element.clientHeight;
}
export const scrollbar_width = getScrollBarWidth();

//https://stackoverflow.com/questions/13142968/deep-comparison-of-objects-arrays
export function compareObjects(o, p) {
  return JSON.stringify(o) === JSON.stringify(p);
  // var i,
  //   keysO = Object.keys(o).sort(),
  //   keysP = Object.keys(p).sort();
  // if (keysO.length !== keysP.length) return false; //not the same nr of keys
  // if (keysO.join("") !== keysP.join("")) return false; //different keys
  // for (i = 0; i < keysO.length; ++i) {
  //   if (o[keysO[i]] instanceof Array) {
  //     if (!(p[keysO[i]] instanceof Array)) return false;
  //     //if (compareObjects(o[keysO[i]], p[keysO[i]] === false) return false
  //     //would work, too, and perhaps is a better fit, still, this is easy, too
  //     if (p[keysO[i]].sort().join("") !== o[keysO[i]].sort().join(""))
  //       return false;
  //   } else if (o[keysO[i]] instanceof Date) {
  //     if (!(p[keysO[i]] instanceof Date)) return false;
  //     if ("" + o[keysO[i]] !== "" + p[keysO[i]]) return false;
  //   } else if (o[keysO[i]] instanceof Function) {
  //     if (!(p[keysO[i]] instanceof Function)) return false;
  //     //ignore functions, or check them regardless?
  //   } else if (o[keysO[i]] instanceof Object) {
  //     if (!(p[keysO[i]] instanceof Object)) return false;
  //     if (o[keysO[i]] === o) {
  //       //self reference?
  //       if (p[keysO[i]] !== p) return false;
  //     } else if (compareObjects(o[keysO[i]], p[keysO[i]]) === false)
  //       return false; //WARNING: does not deal with circular refs other than ^^
  //   }
  //   if (o[keysO[i]] !== p[keysO[i]])
  //     //change !== to != for loose comparison
  //     return false; //not the same value
  // }
  // return true;
}

export function mergeObjectsInPlace(target, source) {
  console.assert(typeof target === typeof source);
  //only mutate strings, numbers, booleans

  if (target instanceof Array) {
    //s -> t (modify)
    const common_length = Math.min(target.length, source.length);
    for (let i = 0; i < common_length; i++) {
      mergeSubEntity(target, source, i);
    }
    //s -> t (add)
    if (target.length < source.length) {
      target.push(...source.slice(target.length));
    } else if (source.length < target.length) {
      //s -> t (remove)
      target.splice(source.length, target.length - source.length);
    }
  } else if (typeof target === "object") {
    //s -> t (modify)
    for (const t_key in target) {
      if (t_key in source && target[t_key] !== source[t_key]) {
        mergeSubEntity(target, source, t_key);
      }
    }
    //s -> t (add)
    const new_s_keys = Object.keys(source).filter(
      (s_key) => !(s_key in target)
    );
    new_s_keys.forEach((s_key) => {
      target[s_key] = source[s_key];
    });
    //s -> t (remove)
    const t_keys_to_remove = Object.keys(target).filter(
      (t_key) => !(t_key in source)
    );
    t_keys_to_remove.forEach((t_key) => {
      delete target[t_key];
    });
  }

  function mergeSubEntity(target, source, key) {
    const s_val = source[key];
    const s_val_type = typeof s_val;
    if (
      s_val_type === "string" ||
      s_val_type === "number" ||
      s_val_type === "boolean"
    ) {
      target[key] = s_val;
    } else {
      mergeObjectsInPlace(target[key], s_val);
    }
  }
}

export function timestamp_string_to_date(timestamp) {
  //example timestamp string "10/31/2021, 10:49:35 AM 221ms"
  const date_regex_matches = timestamp.match(/(.*) (\d{1,3})ms/);
  //index 0 is the entire timestamp string
  //index 1 is date time w/o ms
  // index 2 is ms
  if (date_regex_matches.length < 3) {
    console.error("Could not convert timesatm string: ", timestamp);
  }
  const date_without_ms = date_regex_matches[1];
  const ms = parseInt(date_regex_matches[2]);
  const converted_date = new Date(date_without_ms);
  converted_date.setMilliseconds(ms);
  return converted_date;
}
