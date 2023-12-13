import { get } from "svelte/store";
import { session } from "./../Helper";

export class GoogleAnalytic {
  constructor() {
    const _session = get(session);
    const script = document.createElement("script"); //
    const gtagAdmin = "UA-45208413-12"; //getorderadmin

    if (_session.google_analytic_id) {
      script.setAttribute(
        "src",
        "https://www.googletagmanager.com/gtag/js?id=" +
          _session.google_analytic_id
      );
    }

    script.setAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=" + gtagAdmin
    );

    script.setAttribute("async", "async");
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];

    this.gtag();
    this.gtag("js", new Date());
    if (_session.google_analytic_id) {
      this.gtag("config", _session.google_analytic_id);
    }
    this.gtag("config", gtagAdmin);
  }

  gtag() {
    dataLayer.push(arguments);
  }

  pushShopVisit(shopName, shopData) {
    const gtagData = {
      event_category: "Shop Visit",
    };
    this.gtag("event", shopName, { ...gtagData, shopData });
  }

  pushProductView(productName, productData) {
    const gtagData = {
      event_category: "View Product",
    };
    this.gtag("event", productName, { ...gtagData, productData });
  }
}
