import { writable, derived, get } from "svelte/store";
import unfetch from "unfetch";
const createWritableStore = (key, startValue) => {
  const { subscribe, set, get } = writable(startValue);
  return {
    subscribe,
    set,
    useLocalStorage: () => {
      const json = localStorage.getItem(key);
      if (json) {
        set(JSON.parse(json));
      }
      subscribe((current) => {
        localStorage.setItem(key, JSON.stringify(current));
      });
    },
  };
};
export function isVisible(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;
  var isVisible = elemTop <= 150;
  return isVisible;
}
export function pop_modal() {
  modal.set({});
}
export const s3 = "https://s3.ap-southeast-1.amazonaws.com/assets.getorders/";
export const guest_id = createWritableStore("guest_id", "");
export const modal = writable({});
export const customer = createWritableStore("customer", {
  name: "",
  address: "",
  address2: "",
  postcode: "",
  phone: "",
  coords: [],
});
export const agentID = writable("");
export const agent_id = writable("");
export const isAgent = writable("");
export const Agents = writable([]);
export const outlet_selected = writable("");
export const table_selected = writable("");
export const loading = writable(false);
export const voucher = writable({});
export const orders = createWritableStore("orders", []);
orders.useLocalStorage();
export const session = createWritableStore('session', { orders: [] });
export const cart_list = createWritableStore("cart_list", []);
cart_list.useLocalStorage();
export const tag_id = writable(0);
export const prod_list = derived(session, ($session) =>
  $session ? $session.products : []
);
export const tag_list = derived(prod_list, ($prod_list) => {
  var tags = {};
  if ($prod_list != undefined) {
    $prod_list.forEach((prod) => {
      prod.tags.forEach((tag) => {
        if (!tag.hidden_tag) {
          return tags[tag.id] = tag
        }
      });
    });
  }

  return Object.values(tags).sort(function (a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
});
export function fetch(url, params, met) {
  return new Promise(function (resolve, reject) {
    var sess = get(session);
    // const table_no = get(table_selected);
    var info = {
      method: met || (params ? "POST" : "GET"),
      headers: {
        Code: get(session).token || "",
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": "EF95vGTnuo1GDqSQw6BmN41IR1G5R0Li8E5WIxlm",
      },
    };
    if (sess.type) info.headers.type = "session";
    if (sess.fire_id) info.headers.fire_id = sess.fire_id;
    if (sess.acc_id) info.headers.acc_id = sess.acc_id;
    if (sess.f_id) info.headers.fran_id = sess.f_id;
    if (sess.outlet_id) info.headers.outlet_id = sess.outlet_id;
    if (url.includes('franchise') && sess.table_selected) {
      info.headers.table_selected = sess.table_selected;
    }

    if (params) {
      if (met == "GET") {
        info.headers = { ...info.headers, ...params };
      } else {
        info.body = JSON.stringify(params);
      }
    }
    unfetch(url, info)
      .then((r) => r.json())
      .then((r) => {
        resolve(r);
      })
      .catch(e => {
        alert('Please Check Your Network Connection and Refresh Page...');
      });
  });
}
export function cart_total(value) {
  var cart = value || get(cart_list) || [];
  return cart.reduce((sum, item) => {
    var mods = item.modifiers.reduce((sum, mod) => {
      var amt = parseFloat(mod.amount);
      var actual = mod.mode == 1 ? amt : mod.mode == 2 ? -amt : 0;
      return parseFloat(sum) + actual;
    }, 0);
    return (
      parseFloat(sum) +
      (parseFloat(item.unit_price) + parseFloat(mods)) * item.quantity
    );
  }, 0);
}
export function api(path) {
  var baseUrl = "https://api.getorders.app";
  return `${baseUrl}${path}`;
}
export function headers(params) {
  // const table_no = get(table_selected);
  var headers = {
    Code: get(session).token || "",
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-key": "EF95vGTnuo1GDqSQw6BmN41IR1G5R0Li8E5WIxlm",
  };
  var sess = get(session);
  if (sess.fire_id) headers.fire_id = sess.fire_id;
  if (sess.acc_id) headers.acc_id = sess.acc_id;
  if (sess.f_id) headers.fran_id = sess.f_id;
  if (sess.outlet_id) headers.outlet_id = sess.outlet_id;
  // if (table_no) info.headers.table_id = table_no;
  var header = { method: params ? "POST" : "GET", headers };
  if (params) {
    header.body = JSON.stringify(params);
  }
  return header;
}
export function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}
export function clone(obj) {
  if (obj === null || typeof obj !== "object" || "isActiveClone" in obj)
    return obj;
  if (obj instanceof Date) var temp = new obj.constructor();
  //or new Date(obj);
  else var temp = obj.constructor();
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj["isActiveClone"] = null;
      temp[key] = clone(obj[key]);
      delete obj["isActiveClone"];
    }
  }
  return temp;
}
export function qs(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
export function fill_product(prod_data, p_list) {
  if (!p_list) p_list = get(prod_list);
  prod_data.cart = prod_data.cart.map((pr) => {
    var prod = p_list.filter((prod) => prod.id == pr.id)[0];
    var mods = [];
    prod.modifier_sets.forEach((s) => (mods = [...mods, ...s.modifiers]));
    pr.modifiers = pr.modifiers.map(
      (m) => mods.filter((pm) => pm.id == m.id)[0]
    );
    if (pr.variant.length > 0) {
      pr.variant = pr.variant.map(
        (v) => prod.variants.filter((p) => p.id == v.id)[0]
      );
      prod.unit_price = pr.variant[0].price;
    }
    return { ...prod, ...pr };
  });
  return prod_data;
}
export function close() {
  modal.set({});
}
export const isInputError = writable({
  name: false,
  address: false,
  email: false,
  postcode: false,
  phone: false,
})
