function JSgui() {
	this.currInput = 0;
	this.lineColors = {"#FF0000" : -1, "#0000FF" : -1, "#00FF00" : -1, "#FF00FF" : -1, "#00FFFF" : -1,
		"#000000" : -1, "#990000" : -1, "#000099" : -1, "#009900" : -1, "#999900" : -1, "#990099" : -1, "#009999" : -1};
	this.lineSettings = {0 : {color : "#FF0000"}};
	this.currtool = 'trace';
	this.currEq = 0;
	this.gridlines = 'normal';
	this.settings = {};

	this.setQuality = function(q) {
		$("#quality_select .option").removeClass("option_selected");
		var q2 = Math.round(q * 10);
		$("#quality_select_"+q2).addClass("option_selected");

		jsgcalc.quality = q;
		jsgcalc.draw();
	};

	this.setAngles = function(q) {
		$("#angle_select .option").removeClass("option_selected");
		$("#angle_select_"+q).addClass("option_selected");

		Calc.angles = q;
		jsgcalc.draw();
	};

	this.selectEquation = function(x) {
		this.currEq = x;
		$("#graph_inputs div.graph_input_wrapper").removeClass("active_equation");
		$("#graph_input_wrapper_"+x).addClass("active_equation");
		jsgcalc.draw();
	};

	this.setTool = function(t) {
		$("#tool_select a").removeClass("toolbar_selected");

        var selectedTool = $("#tool_select_"+t);
		selectedTool.addClass("toolbar_selected");

		//Toolbox
		$(".toolbox").hide();

		$("#toolbox_"+t).css({
		  top: 0,
		  left: 0
		}).show();

		this.currtool = t;
		jsgcalc.draw();
	};

	this.setGridlines = function(t) {
		$("#gridlines_select  .option").removeClass("option_selected");
		$("#gridlines_select_"+t).addClass("option_selected");

		this.gridlines = t;
		jsgcalc.draw();
	};
    /*
	this.hideSidebar = function() {
		$("#sidewrapper").hide();
		$("#hideSidebar").hide();
		$("#showSidebar").show();
		$("#toolbar").css("right", "0px");
		jsgcalc.resizeGraph($("#wrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());

		this.setTool(this.currtool);
	}

	this.showSidebar = function() {
		$("#sidewrapper").show();
		$("#hideSidebar").show();
		$("#showSidebar").hide();
		$("#toolbar").css("right", "252px");
		jsgcalc.resizeGraph($("#wrapper").width() - $("#sidewrapper").width() - widthPlusPadding("#toolbar"), $("#wrapper").height());

		this.setTool(this.currtool);
	} */

	this.updateInputData = function() {
		jsgcalc.lines = [];
		$("#graph_inputs div.graph_input_wrapper").each(function() {
			jsgcalc.lines.push({equation : $("input", this).val(), color : $(".graph_color_indicator", this).css('backgroundColor')});
		});
	};

	this.evaluate = function() {
		this.updateInputData();
		jsgcalc.draw();
		this.refreshInputs();
	};

	this.findAvailableColor = function() {
		for(var color in this.lineColors) {
			if(this.lineColors[color] == -1)
				return color;
		}
	};

	//Update gui values
	this.updateValues = function() {
		$("input.jsgcalc_xmin").val(Math.round(jsgcalc.currCoord.x1 * 1000) / 1000);
		$("input.jsgcalc_xmax").val(Math.round(jsgcalc.currCoord.x2 * 1000) / 1000);
		$("input.jsgcalc_ymin").val(Math.round(jsgcalc.currCoord.y1 * 1000) / 1000);
		$("input.jsgcalc_ymax").val(Math.round(jsgcalc.currCoord.y2 * 1000) / 1000);
	};

	this.addInput = function (equation) {
		this.updateInputData();
		var newcolor = this.findAvailableColor();
		this.lineColors[newcolor] = this.currInput;
		jsgcalc.lines.push({
			equation: equation || '',
			color: newcolor
		});
		this.currInput++;
		this.refreshInputs();
	};

	this.refreshInputs = function() {
		var equations = jsgcalc.lines;

		$("#graph_inputs").html("");
		for (var i = 0; i < equations.length; i++) {
			$("#graph_inputs").append("<div id=\"graph_input_wrapper_"+i+"\" class=\"graph_input_wrapper\">"+
				"<div class=\"graph_color_indicator\" id=\"graph_color_indicator_"+i+"\"></div>"+
				"<div class=\"graph_equation_display\"><span>y =</span><input id=\"graph_input_"+i+"\" size=\"20\" value=\""+equations[i].equation+"\" placeholder=\"Enter a function of x\"  spellcheck=\"false\" autocorrect=\"off\" autocapitalize=\"off\" autocomplete=\"off\"><button class=\"remove_equation_button btn btn-default\" title=\"Clear the equation\"><i class=\"fa fa-remove\"></i></button></div></div>");
			$("#graph_color_indicator_"+i).css("backgroundColor", equations[i].color);
			this.lineColors[equations[i].color] = i;
		}

		$("#graph_inputs div.graph_input_wrapper").each(function() {
			$(this).bind("click", function() {
				var id = $(this).attr('id');
				var num = parseInt(id.replace('graph_input_wrapper_', ''));
				jsgui.selectEquation(num);
			});
		});

		this.currInput = equations.length + 1;

		$("#graph_input_wrapper_"+this.currEq).addClass("active_equation");
	};


}

jsgui = new JSgui();

$(document).ready(function() {
    var equations;
    try {
      equations = JSON.parse($('#data_container').attr('data-equations'));
    } catch (e) {
      console.warn("Can't get equations", e);
    }

    if (equations && (equations.length > 0)) {
        _(equations).each(function (equation) {
            jsgui.addInput(equation);
        });

        jsgui.evaluate();
    } else {
        jsgui.addInput('');
    }

    _(['trace', 'vertex', 'root', 'intersect', 'derivative', 'zoombox']).each(function (tool) {
        $('#tool_select_' + tool).click(function (e) {
            jsgui.setTool(tool);
        });
    });

    $('#apply_zoom_button').click(function (e) {
        jsgcalc.setWindow(
          parseFloat($('#toolbox_zoombox_xmin').val(), 10),
          parseFloat($('#toolbox_zoombox_xmax').val(), 10),
          parseFloat($('#toolbox_zoombox_ymin').val(), 10),
          parseFloat($('#toolbox_zoombox_ymax').val(), 10));
    });

    $('#reset_zoom_button').click(function (e) {
        jsgcalc.resetZoom()
    });

	$(".close_button").click(function() {
		$(".toolbox").hide();
	})

    $('#graph_inputs').on('change', 'input', function () {
      var newEquation = $(this).val();
      if (newEquation) {
        jsgui.evaluate();
      }
    });

    $('#graph_inputs').on('click', '.remove_equation_button', function () {
       $(this).closest('.graph_input_wrapper').remove();
       jsgui.updateInputData();
       jsgui.evaluate();
    });

    $('#add_input_button').click(function (e) {
        jsgui.addInput();
    });

    $('#settings_button').click(function (e) {
        $('#settings').toggle(400);
    });

    _(['degrees', 'radians', 'gradians']).each(function (unit) {
        $('#angle_select_' + unit).click(function (e) {
            jsgui.setAngles(unit);
        });
    });

    _(['normal', 'less', 'off']).each(function (x) {
        $('#gridlines_select_' + x).click(function (e) {
            jsgui.setGridlines(x);
        });
    });

    _([1, 5, 10, 50]).each(function (quality) {
        $('#quality_select_' + quality).click(function (e) {
            jsgui.setQuality(quality * 0.1);
        });
    });

    $('#disclaimer_link').click(function (e) {
       e.preventDefault();
       $('#disclaimer_modal').modal();
    });


	document.body.onselectstart = function () { return false; }
});
