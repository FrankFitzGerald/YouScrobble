/* ==|== My Javascript =====================================================
   Author: Frank FitzGerald DIG4503 Rapid App Web Development - Spring Semester 2012
   ========================================================================== */

$(document).ready(function() {
	$('<a id="html5badge" href="http://www.w3.org/html/logo/" target="new"><img src="http://www.w3.org/html/logo/badge/html5-badge-h-css3-performance-semantics.png" width="197" height="64" alt="HTML5 Powered with CSS3 / Styling, Performance &amp; Integration, and Semantics" title="HTML5 Powered with CSS3 / Styling, Performance &amp; Integration, and Semantics"></a>').insertBefore($('#header-container header'));
	$('#html5badge').css({'position': 'absolute', 'top': '0', 'right': '0'});
    $('form').bind('submit',function(e) {
		e.preventDefault();
		$.ajax({
			data: 'search=' + $('#search').val(),
			type: 'get',
			url: 'https://gdata.youtube.com/feeds/api/videos?q='+$("#search").val()+'&most_popular&v=2&alt=json&category=Music',
			dataType:'json',
			success: function(data){
			  var entries = data.feed.entry;
			  console.log(entries);
			  var html = ['<ul class="content">'];
			  for (var i = 0; i < entries.length; i++) {
			    var entry = entries[i].content.src;
			    console.log(entry);
			    var content = '<object width="560" height="315"><param name="movie" value='+entry+'></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src='+entry+' type="application/x-shockwave-flash" width="560" height="315" allowscriptaccess="always" allowfullscreen="true"></embed></object>';
			    html.push('<li>', content, '</li>');
			  }
			  html.push('</ul>');
			  $("#responseDiv").html(html.join(''));
			$('#page_container').pajinate({
				num_page_links_to_display : 5,
				items_per_page : 1
			});
			$('.content').fitVids();
			},
			error: function(data) {
				console.log('the getYoutube.php ajax call failed');
			}
		});
	});
	$('form').bind('submit',function(e) {
		e.preventDefault();
		$.ajax({
			data: 'search=' + $('#search').val(),
			dataType: 'json',
			type: 'get',
			url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist='+$("#search").val()+'&api_key=a4fa2456aad2cd68975c95fd9f3fc3a6&format=json',
			success: function(data){
			  var artist = data.artist;
			  var name = artist.name;
			  var bio = artist.bio.summary;
			  var thumbnails = artist.image;
			  for (var i = 0; i < thumbnails.length; i++) {
			  	var thumbnail = artist.image[i];
			  }
			  var html = ['<h1>Biography of: '+name+'</h1><div class="item">'];
			  html.push('<span class="thumbnail"><img src="'+thumbnail+'"/></span>');
			  html.push('<span class="title">'+bio+'</span>');
			  html.push('</div>');
			  $("#responseDiv2").html(html.join(''));
			},
			error: function(data) {
				console.log('the getLastFM.php ajax call failed');
			}
		});
	});
}); 

// Window load event used just in case window height is dependant upon img
$(window).bind("load", function() { 

       var footerHeight = 0,
           footerTop = 0,
           $footer = $("#footer-container");

       positionFooter();

       function positionFooter() {

                footerHeight = $footer.height();
                footerTop = ($(window).scrollTop()+$(window).height()-footerHeight)+"px";

               if ( ($(document.body).height()+footerHeight) < $(window).height()) {
                   $footer.css({
                        position: "absolute"
                   }).animate({
                        top: footerTop
                   });
               } else {
                   $footer.css({
                        position: "static"
                   });
               }

       }

       $(window).scroll(positionFooter);
       $(window).resize(positionFooter);

});

/* 

 * @projectDescription	Visual Similar Artists

 * @author 	Frank FitzGerald

 * @version 	0.1

 *

 * TODO:

 * DONE: Make words square

 * DONE: Try a few settings out,stop the juttering

 * Adjust colour pallete

 * DONE BUT NOT PERFECT: Ajax loader

 * DONE: Clear canvas on search

 * DONE: Add link to data source + arbor

 * DONE: API Key

 * DONE: Add cursors

 * DONE: Adjust alpha

 * DONE: Code cleanup

 * DONE: Add resize

 * NOT DONE: Click word re-search

 */

var visSimilarArtists = function(){

    //Define vars

    var allData, val, sys, re;

	

	//Particle Colo(u)rs

	var particleColour = {

		root: '#FF003D',

		artist: '#FC930A'

	};

    

    //last.fm settings

    var apiKey = "a4fa2456aad2cd68975c95fd9f3fc3a6";

       

    return {

        init:function(){

            //Attach the events

            $('form').bind('submit',function(e) {

            	e.preventDefault();

                val = $("#search").val();

                if(val === ""){

                    $("<p>").attr("class", "error").text("Please enter a word!").appendTo("label");

                } else {

                    $("p.error").remove();

					$("<img/>").attr({class:"loader", src: "img/1.gif"}).appendTo("#responseDiv2");

                    visSimilarArtists.wordRequest(val);

                }

                return false;

            });

            

            //Start the renderer

            sys = arbor.ParticleSystem({friction:1, stiffness:900, repulsion:100, gravity: true, fps: 60, dt: 0.08, precision: 1.0});

            sys.renderer = Renderer();

        },

        wordRequest:function(word){

            var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + word + "&api_key=" + apiKey + "&autocorrect=1";

            

			//Clear all previous particles

			sys.prune(function(node, from, to){return true;});

			

            $.ajax({

				url: url,

				dataType: "xml",

				type: 'GET',

				error: visSimilarArtists.wordError,

                success: visSimilarArtists.wordSuccess,

				complete: function(){$("img.loader").remove();}

            });

        },

        wordSuccess:function(data){

            //Original word isn't returned in data

            var original = $("#search").val();

            

			//Store all data recieved

            allData = data;
            

            //Add root node

            sys.addNode('home', {label:original, use:'home', alpha:'1', color: particleColour.root, expanded: true, level: 0, parent: null});
            
            var artists = new Array();
            $.each($(allData), function(i){
            	$(this).find('name').each(function(i){
					artists.push($(this).text());
					// $('<span>' + artists[i] + ', </span>').insertAfter('#viewport');
				    sys.addNode(artists[i], {label: artists[i], use:'type', alpha:'1', color: particleColour.artist, expanded: false, level: 1, parent: 'home'});

				    sys.addEdge('home', artists[i],  {length:0.1});
				    if (i >= 20){
				    	return false;
				    }
			    });
			});
		},


        wordError: function(error){

            console.warn("There was an error: " + error);

        },

		// newSearch: function(newword){

		// 	$re = $("#re-search");

		// 	//Show

		// 	$re.find("p span").text(newword).end().show();

			

		// 	//Close if no

		// 	$("#re-search .close, #re-search .no").click(function(e){

		// 		$("#re-search").hide();

		// 		return false;

		// 	});

			

		// 	$re.find(".yes").click(function(e){

		// 		$("#re-search").hide();

		// 		$("#search").val(newword);

		// 		$("p.error").remove();

		// 		$("<img>").attr({class:"loader", src: "img/1.gif"}).appendTo("label");

		// 		//Perform new search

		// 		visSimilarArtists.wordRequest(newword);

		// 		return false;

		// 	});

		// },

		removeNodes: function(name, level){

			if(level === 2){

				//Clicked node

				var clicked = sys.getNode(name);

				

				//Clicked parent node

				var parent = sys.getNode(clicked.data.parent);

				

				//Parent is nolonger expanded

				parent.data.expanded = false;

				

				//Remove Children

				sys.prune(function(node, from, to){

					if(node.data.parent === name){

						return true;

					}

				});

				

				//Remove clicked node too

				sys.pruneNode(name);

			}

		}

    };

}();



//The arbor renderer

var Renderer = function(){

    var canvas = document.getElementById("viewport");

	var dom = $("#viewport");
    

    //Screen size

	var cWidth = canvas.width = $("#arbor-container").width();

	var cHeight = canvas.height = window.innerHeight;

    var context = canvas.getContext('2d');

    var particleSystem;

    

   var gfx = arbor.Graphics(canvas);

    

    return {

        init:function(system){

            //Define some particle system settings

            particleSystem = system;

            particleSystem.screenSize(cWidth, cHeight);

            particleSystem.screenPadding(60);

            

            //Node dragging

            this.initMouseHandling();

			

			//On window resize

			$(window).resize(this.windowsized);

        },

		windowsized:function(){

			cWidth = $("#arbor-container").width();

			cHeight = window.innerHeight;

			

			particleSystem.screenSize(cWidth, cHeight);

		},

        redraw:function(){

            //Set the canvas styles for every redraw

            context.fillStyle = "#F16529";

            context.fillRect(0,0, cWidth, cHeight);

            

            //The lines between nodes

            particleSystem.eachEdge(function(edge, pt1, pt2){

                // draw a line from pt1 to pt2

                context.strokeStyle = "rgba(0,0,0, .333)";

                context.lineWidth = 1;

                context.beginPath();

                context.moveTo(pt1.x, pt1.y);

                context.lineTo(pt2.x, pt2.y);

                context.stroke();

            });

            

            //The style of each node

            particleSystem.eachNode(function(node, pt){

                var w;

                

                //Create our different types of nodes

                if(node.data.use === 'home'){

                    w = 110;

                    gfx.oval(pt.x-w/2, pt.y-w/2, w, w, {fill:node.data.color, alpha:node.data.alpha});

                    gfx.text(node.data.label, pt.x, pt.y+4, {color:"white", align:"center", font:"Arial", size:12});

                } else if(node.data.use === 'type'){

                    w = 75;

                    gfx.oval(pt.x-w/2, pt.y-w/2, w, w, {fill:node.data.color, alpha:node.data.alpha});

                    gfx.text(node.data.label, pt.x, pt.y+4, {color: "white", align:"center", font:"Arial", size:9});

                }

            });

        },

        initMouseHandling:function(){

			var _mouseP, selected;

            var dragged = null;

			var nearest = null;



            var handler = {

				moved:function(e){

					var pos = $(canvas).offset();

					_mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

					nearest = particleSystem.nearest(_mouseP);

					

					if(!nearest.node){

						return false;

					}

					

					if(!(nearest.node.data.use === 'home')){

						selected = (nearest.distance < 30) ? nearest : null;

						if(selected){

							dom.addClass('hovered');

						} else {

							dom.removeClass('hovered');

						}

					}

					return false;

				},

                clicked:function(e){

                    var pos = $(canvas).offset();

                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

                    dragged = particleSystem.nearest(_mouseP);

                    

                    if (dragged && dragged.node !== null){

                        //Store the clicked node name

						var nName, nLevel;

						

                        if(!dragged.node.data.expanded){

                            dragged.node.data.expanded = true;

                            nName = dragged.node.name;

                            nLevel = dragged.node.data.level;

                            if(nLevel === 1){

                                //Clicking on a single artist, search it?

                                visSimilarArtists.newSearch(dragged.node.data.label);

                            }else {

                                return false;

                            }

                        } else {

							//Node expanded so remove

							nName = dragged.node.name;

							nLevel = dragged.node.data.level;

							visSimilarArtists.removeNodes(nName, nLevel);

						}

                        dragged.node.fixed = true;

                    }



                    $(canvas).bind('mousemove', handler.dragged);

                    $(window).bind('mouseup', handler.dropped);

                    return false;

                },

                dragged:function(e){

                    var pos = $(canvas).offset();

                    var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

                    

                    if (dragged && dragged.node !== null){

                        var p = particleSystem.fromScreen(s);

                        dragged.node.p = p;

                    }

                    

                    return false;

                },

                dropped:function(e){

                    if (dragged===null || dragged.node===undefined) {

                        return;

                    }

                    if (dragged.node !== null){

                        dragged.node.fixed = false;

                    }

                    dragged.node.tempMass = 1000;

                    dragged = null;

                    $(canvas).unbind('mousemove', handler.dragged);

                    $(window).unbind('mouseup', handler.dropped);

                    _mouseP = null;

                    return false;

                }

            };



            // start listening

            $(canvas).mousedown(handler.clicked);

			$(canvas).mousemove(handler.moved);

        }

    };

};



jQuery(function($){
    visSimilarArtists.init();
});

