!function(){var a;a=jQuery,Craft.ClearCachesUtility=Garnish.Base.extend({init:function(t){for(var e=this,s=a("form.utility"),r=function(a){var t=s.eq(a),r=t.find("input[type=checkbox]"),n=t.find(".btn"),i=function(){r.filter(":checked").length?n.removeClass("disabled"):n.addClass("disabled")};r.on("change",i),i(),e.addListener(t,"submit",(function(a){a.preventDefault(),n.hasClass("disabled")||e.onSubmit(a)}))},n=0;n<s.length;n++)r(n)},onSubmit:function(t){var e,s,r=a(t.currentTarget),n=r.find("button.submit"),i=r.find(".utility-status");n.hasClass("disabled")||(r.data("progressBar")?((e=r.data("progressBar")).resetProgressBar(),s=r.data("allDone")):(e=new Craft.ProgressBar(i),r.data("progressBar",e)),e.$progressBar.removeClass("hidden"),e.$progressBar.velocity("stop").velocity({opacity:1},{complete:function(){var t=Garnish.getPostData(r),o=Craft.expandPostArray(t);Craft.sendActionRequest("POST",params.action,{data:o}).then((function(t){e.setProgressPercentage(100),setTimeout((function(){s||((s=a('<div class="alldone" data-icon="done" />').appendTo(i)).css("opacity",0),r.data("allDone",s)),e.$progressBar.velocity({opacity:0},{duration:"fast",complete:function(){s.velocity({opacity:1},{duration:"fast"}),n.removeClass("disabled"),n.trigger("focus")}})}),300)})).catch((function(a){var t=a.response;alert(t.message)}))}}),s&&s.css("opacity",0),n.addClass("disabled"),n.trigger("blur"))}})}();
//# sourceMappingURL=ClearCachesUtility.js.map