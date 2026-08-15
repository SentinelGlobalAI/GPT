export function OpenAIAdsPixel() {
  const pixelId = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <script
      id="openai-ads-pixel"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,u,p){
        if(!p)return;
        if(!w.oaiq){
          var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;
          var js=d.createElement(s);js.async=true;js.src=u;
          var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f);
        }
        var consent=false;
        try{consent=w.localStorage.getItem("sg_measurement_consent")==="granted"}catch(e){}
        w.oaiq("consent",consent);
        w.oaiq("init",{pixelId:p});
      })(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js",${JSON.stringify(pixelId)});`
      }}
    />
  );
}
