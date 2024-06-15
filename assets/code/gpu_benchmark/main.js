const promises = [
	// Benchmark : https://www.kaggle.com/datasets/alanjo/gpu-benchmarks
	// Specification : https://www.kaggle.com/datasets/alanjo/graphics-card-full-specs
	// 讀取上述整合的資料集
	d3.csv("dataset/gpu_dataset_v3.csv"),
];
const typesettings = {};
Promise.all(promises).then(allData => {

	const manuf_text = {"Intel": 0, "NVIDIA": 1, "AMD": 2, "Others": 3};
	const manuf_size = Object.keys(manuf_text).length;
	const manuf_counter = Array(manuf_size).fill(0);
	const histogram_tick = 5;
	const histogram_tick_size = 2;
	const histogram_attr = [
		{"attr": "price",    "text": "Price",    "min": Number.MAX_VALUE, "max": 0, "max_counter": 0, "color": d3.rgb(110, 176, 177)},
		{"attr": "G2Dmark",  "text": "2D score", "min": Number.MAX_VALUE, "max": 0, "max_counter": 0, "color": d3.rgb(236, 101,  86)},
		{"attr": "G3Dmark",  "text": "3D score", "min": Number.MAX_VALUE, "max": 0, "max_counter": 0, "color": d3.rgb(249, 146,  35)},
		{"attr": "gpuValue", "text": "CPI",      "min": Number.MAX_VALUE, "max": 0, "max_counter": 0, "color": d3.rgb( 72, 119, 168)}
	];
	const histogram_size = histogram_attr.length;
	const parallel_attr = [
		{"attr": "releaseYear", "text": "Year",     "min": Number.MAX_VALUE, "max": 0, "selection": [0, 0]},
		{"attr": "price",       "text": "Price",    "min": Number.MAX_VALUE, "max": 0, "selection": [0, 0]},
		{"attr": "G2Dmark",     "text": "2D score", "min": Number.MAX_VALUE, "max": 0, "selection": [0, 0]},
		{"attr": "G3Dmark",     "text": "3D score", "min": Number.MAX_VALUE, "max": 0, "selection": [0, 0]},
		{"attr": "id",          "text": "ID",       "min": 0, "max": 0}
	];
	const parallel_size = parallel_attr.length;
	const parallel_name = Array(parallel_size).fill().map((d, i) => parallel_attr[i]["attr"]);
	const table_attr = [
		{"attr": "id",           "text": "ID",           "w": 50, "x": 0},
		{"attr": "gpuName",      "text": "GPU Name",     "w": 250},
		{"attr": "manufacturer", "text": "Manufacturer", "w": 110},
		{"attr": "releaseYear",  "text": "Year",         "w": 70},
		{"attr": "price",        "text": "Price",        "w": 140},
		{"attr": "G2Dmark",      "text": "2D Score",     "w": 140},
		{"attr": "G3Dmark",      "text": "3D Score",     "w": 140},
		{"attr": "gpuValue",     "text": "CPI",          "w": 140}
	];
	const table_size = table_attr.length;
	for(let i = 1; i < table_size; ++i){ table_attr[i]["x"] = table_attr[i-1]["x"] + table_attr[i-1]["w"]; }
	var   cdata = [];
	const conds = {
		"parallel": Array(parallel_size*2).fill().map((d, i) => i%2 == 0 ? 0 : Number.MAX_VALUE),
		"manuf": Array(manuf_size).fill(-1),
		"sort_id": 0,
		"descend": true,
		"highlight_id": 0
	};

	allData[0].forEach(d => {
		d["id"] = 0;
		d["releaseYear"] = Number(d["releaseYear"]);
		d["price"] = Number(d["price"]);
		d["G2Dmark"] = Number(d["G2Dmark"]);
		d["G3Dmark"] = Number(d["G3Dmark"]);
		d["gpuValue"] = Number(d["gpuValue"]);

		manuf_counter[manuf_text[d["manufacturer"]]] += 1;
		d["id"] = cdata.length + 1;
		cdata.push(d);

		for(let i = 0; i < parallel_size-1; ++i){
			const a = parallel_attr[i];
			if(a["min"] > d[a["attr"]]){ a["min"] = d[a["attr"]]; }
			if(a["max"] < d[a["attr"]]){ a["max"] = d[a["attr"]]; }
		}

		for(let i = 0; i < histogram_size; ++i){
			const a = histogram_attr[i];
			if(a["min"] > d[a["attr"]]){ a["min"] = d[a["attr"]]; }
			if(a["max"] < d[a["attr"]]){ a["max"] = d[a["attr"]]; }
		}
	});
	parallel_attr[parallel_size-1]["min"] = allData[0].length;
	parallel_attr[parallel_size-1]["max"] = Math.min(1, allData[0].length);

	const svg = d3.select("svg")
				  .attr("width", 1680)
				  .attr("height", 810);

	// Donut Chart
	{
		typesettings["dount"] = {};
		const t = typesettings["dount"];
		t.FWidth = 520, t.FHeight = 240, t.FLeftTopX = 10, t.FLeftTopY = 10;
		t.MARGIN = {LEFT: 10, RIGHT: 10, TOP: 30, BOTTOM: 10};
		t.WIDTH = t.FWidth - (t.MARGIN.LEFT + t.MARGIN.RIGHT);
		t.HEIGHT = t.FHeight - (t.MARGIN.TOP + t.MARGIN.BOTTOM);
		t.DCenterX = 250, t.DCenterY = 88, t.DInnerR = 50, t.DOuterR = 80;
		t.CWidth = 20, t.CHeight = 20, t.CMargin = 2, t.CLeftTopX = 360, t.CLeftTopY = 88;

		const g = svg.append("g")
					 .attr("id", "donut")
					 .attr("transform", `translate(${t.FLeftTopX + t.MARGIN.LEFT}, ${t.FLeftTopY + t.MARGIN.TOP})`);

		// Hint
		g.append("image")
		 .attr("x", t.WIDTH / 2 - 112)
		 .attr("y", -40)
		 .attr("width", 16)
		 .attr("href", "image/hint.png")
		 .append("title")
		 .text("1.「Click」 manufacturer color cube.\n2.「Click again」 to delete.");

		// Main Title
		g.append("text")
		 .attr("x", t.WIDTH / 2)
		 .attr("y", -20)
		 .attr("font-size", "20px")
		 .attr("font-weight", "900")
		 .attr("text-anchor", "middle")
		 .text("Manufacturer Filter");

		// Color : https://github.com/d3/d3-scale-chromatic/blob/main/README.md
		const color = d3.scaleOrdinal()
						.domain(Array.from(Array(manuf_size).keys()))
						.range(d3.schemeCategory10);
		for(let i = 0; i < manuf_size; ++i){
			g.append("rect")
			 .attr("y", t.CLeftTopY + i * (t.CHeight + t.CMargin))
			 .attr("x", t.CLeftTopX)
			 .attr("width", t.CWidth)
			 .attr("height", t.CHeight)
			 .attr("fill", color(i))
			 .attr("stroke-width", 2)
			 .style("cursor", "pointer")
			 .on("click", clicked);
			g.append("text")
			 .attr("y", t.CLeftTopY + (i + 1) * (t.CHeight + t.CMargin) - 5)
			 .attr("x", t.CLeftTopX + t.CWidth + 10)
			 .attr("font-size", "20px")
			 .text(Object.keys(manuf_text)[i]);

			// Click
			function clicked(event){
				conds["manuf"][i] *= -1;
				update_data(event);
			}
		}

		// Donut
		const manuf_counter_sum = manuf_counter.reduce((sum, value) => sum + value);
		const manuf_counter_sdf = manuf_counter;
		for(let i = 1; i < manuf_size; ++i){ manuf_counter_sdf[i] += manuf_counter_sdf[i-1]; }
		const arcGenerator = d3.arc().innerRadius(t.DInnerR).outerRadius(t.DOuterR);
		g.selectAll("path")
		 .data(Array(manuf_size).fill().map((d, i) => {
			 const end_angle = (manuf_counter_sdf[manuf_size-1-i] / manuf_counter_sum) * 2 * Math.PI;
			 return {startAngle: 0, endAngle: end_angle};
		 }))
		 .enter()
		 .append("path")
		 .attr("id", (d, i) => "donut_path_" + (manuf_size-1-i))
		 .attr("my_attr_end_angle", d => d.endAngle)
		 .attr("transform", `translate(${t.DCenterX}, ${t.DCenterY})`)
		 .attr("d", arcGenerator)
		 .attr("fill", (d, i) => color(manuf_size-1-i));
	}

	// Parallel Coordinate Plot : https://d3-graph-gallery.com/graph/parallel_custom.html
	{
		typesettings["parallel"] = {};
		const t = typesettings["parallel"];
		t.FWidth = 520, t.FHeight = 500, t.FLeftTopX = 10, t.FLeftTopY = 260;
		t.MARGIN = {LEFT: 10, RIGHT: 10, TOP: 30, BOTTOM: 10};
		t.WIDTH = t.FWidth - (t.MARGIN.LEFT + t.MARGIN.RIGHT);
		t.HEIGHT = t.FHeight - (t.MARGIN.TOP + t.MARGIN.BOTTOM);
		t.BWidth = 40, t.BHeight = 460, t.BMargin = 80, t.BLeftTopX = 10, t.BLeftTopY = 40;
		t.RMargin = 10, t.RLeftTopY = t.BLeftTopY - t.RMargin, t.RHeight = t.BHeight + t.RMargin * 2;

		const g = svg.append("g")
					 .attr("id", "parallel")
					 .attr("transform", `translate(${t.FLeftTopX + t.MARGIN.LEFT}, ${t.FLeftTopY + t.MARGIN.TOP})`);

		// Hint
		g.append("image")
		 .attr("x", t.WIDTH / 2 - 92)
		 .attr("y", -40)
		 .attr("width", 16)
		 .attr("href", "image/hint.png")
		 .append("title")
		 .text("1.「Brush」 attribute axis.\n2.「Click」 outside the range to delete.\n3.「Click」 attribute name to swap with the penultimate one.");

		// Main Title
		g.append("text")
		 .attr("x", t.WIDTH / 2)
		 .attr("y", -20)
		 .attr("font-size", "20px")
		 .attr("font-weight", "900")
		 .attr("text-anchor", "middle")
		 .text("Attribute Filter");

		// Texts
		g.selectAll(".parallel_attr_text")
		 .data(parallel_attr)
		 .enter()
		 .append("text")
		 .attr("class", "parallel_attr_text")
		 .attr("y", (d, i) => t.BLeftTopY - 20)
		 .attr("x", (d, i) => t.BLeftTopX + i * (t.BWidth + t.BMargin))
		 .attr("font-size", "20px")
		 .style("cursor", "pointer")
		 .text(d => d["text"])
		 .on("click", function clicked(event, d){
			let from_id = 0;
			let to_id = parallel_attr.length-2;
			for(; from_id < parallel_attr.length-2 && parallel_attr[from_id] != d; ++from_id);
			if(from_id != to_id){ sort_attr(event, from_id, to_id); }
		 });

		// X & Y Scales
		const xScale = d3.scalePoint()
						 .domain(parallel_name)
						 .range([0, (t.BWidth + t.BMargin) * (parallel_size - 1)]);
		const yScales = {};
		for(let i = 0; i < parallel_size; ++i){
			const yScale = d3.scaleLinear()
							 .domain([parallel_attr[i]["max"], parallel_attr[i]["min"]])
							 .range([0, t.BHeight]);
			yScales[parallel_name[i]] = yScale;
		}

		// Paths
		const color = d3.scaleOrdinal()
						.domain(Array.from(Array(manuf_size).keys()))
						.range(d3.schemeCategory10);
		function path(d) {
			const lines = Array(parallel_size*2).fill().map((d, i) => parallel_name[Math.trunc(i/2)]);
			return d3.line()(lines.map((p, i) => {
				const f = (i/2) % 1 != 0;
				const x = xScale(p) + t.BLeftTopX + (f ? t.BWidth : 0);
				const y = yScales[p](d[p]) + t.BLeftTopY;
				return [x, y];
			}));
		}
		g.selectAll(".parallel_attr_path")
		 .data(cdata)
		 .enter()
		 .append("path")
		 .attr("class", d => "parallel_attr_path my_id_"+d["id"])
		 .attr("d", path)
		 .attr("fill", "none")
		 .attr("stroke", d => color(manuf_text[d["manufacturer"]]))
		 .attr("stroke-width", 1);

		// Rectangles
		g.selectAll(".parallel_attr_rect")
		 .data(parallel_attr)
		 .enter()
		 .append("rect")
		 .attr("class", "parallel_attr_rect")
		 .attr("y", (d, i) => t.RLeftTopY)
		 .attr("x", (d, i) => t.BLeftTopX + i * (t.BWidth + t.BMargin))
		 .attr("width", t.BWidth)
		 .attr("height", t.RHeight)
		 .attr("fill", "lightgray");

		for(let i = 0; i < parallel_size; ++i){

			// Y Axis
			const yScale = yScales[parallel_name[i]];
			const yAxis = d3.axisLeft(yScale)
							.ticks(20)
							.tickSize(2);
			g.append("g")
			 .attr("id", "parallel_"+i+"_axis")
			 .attr("transform", `translate(${t.BLeftTopX + t.BWidth + i * (t.BWidth + t.BMargin)}, ${t.BLeftTopY})`)
			 .call(yAxis);

			if(i == parallel_size-1) { break; }

			// Brush
			function brushed(event) {
				let extent = event.selection;
				conds["parallel"][i*2]   = yScale.invert(extent[1] - t.BLeftTopY);
				conds["parallel"][i*2+1] = yScale.invert(extent[0] - t.BLeftTopY);
				parallel_attr[i]["selection"] = extent;
			}
			function refresh(event) {
				let extent = event.selection;
				if(extent[0] == extent[1])
				{
					conds["parallel"][i*2]   = parallel_attr[i]["min"];
					conds["parallel"][i*2+1] = parallel_attr[i]["max"];
				}
				parallel_attr[i]["selection"] = extent;
			}
			const brush = d3.brushY()
							.extent([[t.BLeftTopX + i * (t.BWidth + t.BMargin),           t.BLeftTopY],
									 [t.BLeftTopX + i * (t.BWidth + t.BMargin) + t.BWidth, t.BLeftTopY + t.BHeight]])
							.on("start", refresh)
							.on("brush", brushed)
							.on("end",   update_data);
			g.append("g")
			 .attr("id", "parallel_"+i+"_brush")
			 .call(brush);
		}
	}

	// Histogram
	{
		typesettings["histogram"] = {};
		const t = typesettings["histogram"];
		t.FWidth = table_attr.map(d => d["w"]).reduce((sum, value) => sum + value),
		t.FHeight = 240, t.FLeftTopX = 600, t.FLeftTopY = 10;
		t.MARGIN = {LEFT: 10, RIGHT: 10, TOP: 30, BOTTOM: 10};
		t.WIDTH = t.FWidth - (t.MARGIN.LEFT + t.MARGIN.RIGHT);
		t.HEIGHT = t.FHeight - (t.MARGIN.TOP + t.MARGIN.BOTTOM);
		t.HLeftTopX = 10, t.HLeftTopY = 60, t.HWidth = 220, t.HHeight = 140, t.HMargin = 40;

		const g = svg.append("g")
					 .attr("id", "histogram")
					 .attr("transform", `translate(${t.FLeftTopX + t.MARGIN.LEFT}, ${t.FLeftTopY + t.MARGIN.TOP})`);

		// Hint
		g.append("image")
		 .attr("x", t.WIDTH / 2 - 152)
		 .attr("y", -40)
		 .attr("width", 16)
		 .attr("href", "image/hint.png")
		 .append("title")
		 .text("1.「Mouseover」 bar to view value.\n2.「Click」 triangle to align stacked bar chart.\n3.「Click」 table-header to sort data in descending or ascending order.\n4.「Click」 table-body to highlight data.");

		// Main Title
		g.append("text")
		 .attr("x", t.WIDTH / 2)
		 .attr("y", -20)
		 .attr("font-size", "20px")
		 .attr("font-weight", "900")
		 .attr("text-anchor", "middle")
		 .text("Distribution of each Attribute");

		for(let i = 0; i < histogram_size; ++i){

			// Group
			const a = histogram_attr[i];
			const h = g.append("g")
					   .data(histogram_attr)
					   .attr("id", "histogram_"+a["attr"]+"_g")
					   .attr("transform", `translate(${t.HLeftTopX + i * (t.HWidth + t.HMargin)}, ${t.HLeftTopY})`);

			// Text
			h.append("text")
			 .attr("x", t.HWidth / 2)
			 .attr("y", -20)
			 .attr("font-size", "20px")
			 .attr("text-anchor", "middle")
			 .text(a["text"]);

			// X Axis
			const xScale = d3.scaleLinear()
							 .domain([a["min"], a["max"]])
							 .range([0, t.HWidth]);
			const xAxis  = d3.axisBottom(xScale)
							 .ticks(histogram_tick)
							 .tickSize(histogram_tick_size);
			h.append("g")
			 .attr("transform", `translate(0, ${t.HHeight})`)
			 .call(xAxis);

			// Histogram : https://d3-graph-gallery.com/graph/histogram_basic.html
			const histogram = d3.histogram()
								.value(d => d[a["attr"]])
								.domain(xScale.domain())
								.thresholds(xScale.ticks(histogram_tick));
			a["histogram"] = histogram;
			const bins = histogram(allData[0]);
			a["max_counter"] = d3.max(bins, d => d.length);
			a["counter"] = bins.map(d => d.length);
			console.log(a["counter"]);

			// Y Axis
			const yScale = d3.scaleLinear()
							 .domain([a["max_counter"], 0])
							 .range([0, t.HHeight]);
			const yAxis  = d3.axisLeft(yScale)
							 .ticks(histogram_tick)
							 .tickSize(histogram_tick_size);
			h.append("g")
			 .attr("transform", `translate(0, 0)`)
			 .call(yAxis);

			// Borders
			h.selectAll(".histogram_bin_border_rect")
			 .data(bins)
			 .enter()
			 .append("rect")
			 .attr("class", (_, i) => "histogram_bin_border_rect histogram_"+a["attr"]+"_bin_border_"+i)
			 .attr("x", 1)
			 .attr("transform", d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
			 .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
			 .attr("height", d => t.HHeight - yScale(d.length))
			 .attr("fill", "white")
			 .attr("stroke", "black")
			 .attr("stroke-width", "2");

			// Rectangles
			h.selectAll(".histogram_bin_rect")
			 .data(bins)
			 .enter()
			 .append("rect")
			 .attr("class", "histogram_bin_rect")
			 .attr("x", 2)
			 .attr("transform", d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
			 .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 4))
			 .attr("height", d => t.HHeight - yScale(d.length))
			 .attr("fill", a["color"]);

			// Tooltips
			h.selectAll(".histogram_tooltip_rect")
			 .data(bins)
			 .enter()
			 .append("rect")
			 .attr("class", "histogram_tooltip_rect")
			 .attr("x", 1)
			 .attr("transform", d => `translate(${xScale(d.x0)}, 0)`)
			 .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
			 .attr("height", d => t.HHeight)
			 .attr("fill", "white")
			 .attr("opacity", 0.01)
			 .append("title")
			 .text((d, i) => d.length + "/" + a["counter"][i]);
		}

		// Data Size Text
		g.append("text")
		 .attr("id", "histogram_data_size_text")
		 .attr("x", t.WIDTH / 2)
		 .attr("y", 4)
		 .attr("font-size", "20px")
		 .attr("text-anchor", "middle")
		 .text(`find ${cdata.length} data (total ${allData[0].length} data in our dataset)`);
	}

	// Table (Stacked Bar Chart)
	{
		//============
		// 繪製 Table
		//============
		typesettings["table"] = {};
		const tableT = typesettings["table"];
		tableT.FWidth = table_attr.map(d => d["w"]).reduce((sum, value) => sum + value) + 20;
		tableT.FHeight = 460, tableT.FLeftTopX = 600, tableT.FLeftTopY = 300;
		tableT.MARGIN = {LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 0};
		tableT.WIDTH = tableT.FWidth - (tableT.MARGIN.LEFT + tableT.MARGIN.RIGHT);
		tableT.HEIGHT = tableT.FHeight - (tableT.MARGIN.TOP + tableT.MARGIN.BOTTOM);
		tableT.rowHeight = [ 20, 20 ];  // Header 的高度 & 其他 Row 的高度
		tableT.fillColor = [ d3.rgb(220, 220, 220), d3.rgb(255, 255, 255) ];  // Header 的填充顏色 & 其他 Cell 的填充顏色
		tableT.fontSize = [ 12, 12 ];  // Header 的文字大小 & 其他 Cell 的文字大小
		tableT.fontFamily = [ "Calibri", "Calibri" ];  // Header 的字體 & 其他 Cell 的字體
		tableT.fontColor = [ d3.rgb(50, 50, 50), d3.rgb(50, 50, 50) ];  // Header 的文字顏色 & 其他 Cell 的文字顏色
		tableT.stroke = d3.rgb(100, 100, 100);  // 線條顏色
		tableT.strokeWidth = 0.2;  // 線條粗細

		// 建立 Table Header 的容器
		const tableHeaderG = svg.append("g")
			.attr("id", "table-header")
			.attr("transform", `translate(${tableT.FLeftTopX + tableT.MARGIN.LEFT}, ${tableT.FLeftTopY + tableT.MARGIN.TOP})`);

		// Highlight ID Text
		tableHeaderG.append("text")
					.attr("id", "table_highlight_id_text")
					.attr("x", 0)
					.attr("y", -10)
					.attr("font-size", "20px")
					.text("Highlight ID : " + (conds["highlight_id"] > 0 ? conds["highlight_id"] : "none"));

		// 繪製 Table Header 的矩形
		tableHeaderG.append("g").selectAll("rect").data(table_attr)
			.enter().append("rect")
			.attr("x", (_, i) => table_attr[i].x)
			.attr("y", 0)
			.attr("width", (_, i) => table_attr[i].w)
			.attr("height", tableT.rowHeight[0])
			.attr("fill", tableT.fillColor[0])
			.attr("stroke", tableT.stroke)
			.attr("stroke-width", tableT.strokeWidth)
			.on("click", sortButtonHandler)
			.style("cursor", "pointer");

		// 繪製 Table Header 的文字
		tableHeaderG.append("g").selectAll("text").data(table_attr)
			.enter().append("text")
			.attr("x", (_, i) => table_attr[i].x + table_attr[i].w / 2)
			.attr("y", tableT.rowHeight[0] / 2 + 1)
			.attr("font-size", tableT.fontSize[0])
			.attr("font-family", tableT.fontFamily[0])
			.attr("font-weight", "bold")
			.style("fill", tableT.fontColor[0])
			.attr("text-anchor", "middle")  // 水平置中對齊
			.attr("dominant-baseline", "middle")  // 垂直置中對齊
			.text(d => d.text)
			.on("click", sortButtonHandler)
			.style("cursor", "pointer");

		// 建立 Table Body 的容器
		const divTableBody = d3.select("#table-body-container")
			.style("top", tableT.FLeftTopY + tableT.MARGIN.TOP + tableT.rowHeight[0] + 8 + "px")
			.style("left", tableT.FLeftTopX + tableT.MARGIN.LEFT + 8 + "px")
			.style("width", tableT.WIDTH + "px")
			// .style("background-color", "red")
			.style("height", tableT.HEIGHT + 10 + "px");

		const svgTableBody = d3.select("#table-body-svg")
			.attr("width", tableT.WIDTH - 20)
			.attr("height", tableT.rowHeight[1] * cdata.length > tableT.HEIGHT ? tableT.rowHeight[1] * cdata.length : tableT.HEIGHT)
			.attr("font-size", tableT.fontSize[1])
			.attr("font-family", tableT.fontFamily[1])
			.attr("text-anchor", "middle")  // 水平置中對齊
			.attr("dominant-baseline", "middle")  // 垂直置中對齊
			.attr("fill", tableT.fontColor[1]);

		const tableBodyRowsG = svgTableBody.append("g")
			.attr("id", "table-body")
			.selectAll(".table_item_g")
			.data(allData[0])
			.join("g")  // 每個 Row 為一個 Group
			.attr("class", "table_item_g")
			.attr("transform", d => `translate(0, ${(d["id"]-1) * tableT.rowHeight[1]})`)
			.attr("stroke", tableT.stroke)
			.attr("stroke-width", tableT.strokeWidth)
			.on("click", (event, d) => {
				conds["highlight_id"] = conds["highlight_id"] == d["id"] ? 0 : d["id"];
				highlight_data(event);
			});

		// 繪製 Table Body 的矩形和文字
		for (let i = 0; i < table_size; ++i) {
			const a = table_attr[i];

			// 繪製每個 Row 的矩形
			tableBodyRowsG.append("rect")
				.attr("class", "table_" + a["attr"] + "_rect")
				.attr("x", a["x"])
				.attr("y", 0)
				.attr("width", a["w"])
				.attr("height", tableT.rowHeight[1])
				.attr("fill", tableT.fillColor[1]);

			// 繪製每個 Row 的文字
			tableBodyRowsG.append("text")
				.attr("class", "table_" + a["attr"] + "_text")
				.attr("x", a["x"] + a["w"]/2)
				.attr("y", tableT.rowHeight[1] / 2 + 1)
				.text(d => i < 4 ? d[a["attr"]] : "");
		}

		//========================
		// 繪製 Stacked Bar Chart
		//========================
		typesettings["stackedBar"] = {};
		const stackT = typesettings["stackedBar"];
		stackT.FWidth = 1000, stackT.FHeight = 1000, stackT.FLeftTopX = 0, stackT.FLeftTopY = 0;
		stackT.MARGIN = {LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 0};
		stackT.WIDTH = stackT.FWidth - (stackT.MARGIN.LEFT + stackT.MARGIN.RIGHT);
		stackT.HEIGHT = stackT.FHeight - (stackT.MARGIN.TOP + stackT.MARGIN.BOTTOM);
		stackT.keys = [ "price_normalized", "G2Dmark_normalized", "G3Dmark_normalized", "gpuValue_normalized" ];  // 四個比較項目
		stackT.fillColor = [ d3.rgb(110, 176, 177), d3.rgb(236, 101, 86), d3.rgb(249, 146, 35), d3.rgb(72, 119, 168) ];  // 四個項目對應的顏色
		stackT.colWidths = [ table_attr[4].w, table_attr[5].w, table_attr[6].w, table_attr[7].w ]; // 四個項目的寬度
		stackT.rowHeight = tableT.rowHeight[1];
		stackT.barHeight = stackT.rowHeight * 0.8;
		stackT.alignment = 0;  // 當前選中
		stackT.minLength = 10;  // 預留最小長度，以免完全看不到 Bar

		// 取得 G3Dmark, G2Dmark, price, gpuValue 的最大值和最小值
		const extentG3Dmark = d3.extent(allData[0], d => d.G3Dmark);
		const extentG2Dmark = d3.extent(allData[0], d => d.G2Dmark);
		const extentPrice = d3.extent(allData[0], d => d.price);
		const extentGpuValue = d3.extent(allData[0], d => d.gpuValue);
		// 正規化數據
		allData[0].forEach(d => {
			d.price_normalized = d.G3Dmark_normalized = d.G2Dmark_normalized = d.gpuValue_normalized = stackT.minLength;
			if ((extentPrice[1] - extentPrice[0]) !== 0)
				d.price_normalized = ((d.price - extentPrice[0]) * (table_attr[4].w - stackT.minLength) / (extentPrice[1] - extentPrice[0]) + stackT.minLength).toFixed(2);
			if ((extentG2Dmark[1] - extentG2Dmark[0]) !== 0)
				d.G2Dmark_normalized = ((d.G2Dmark - extentG2Dmark[0]) * (table_attr[5].w - stackT.minLength) / (extentG2Dmark[1] - extentG2Dmark[0]) + stackT.minLength).toFixed(2);
			if ((extentG3Dmark[1] - extentG3Dmark[0]) !== 0)
				d.G3Dmark_normalized = ((d.G3Dmark - extentG3Dmark[0]) * (table_attr[6].w - stackT.minLength) / (extentG3Dmark[1] - extentG3Dmark[0]) + stackT.minLength).toFixed(2);
			if ((extentGpuValue[1] - extentGpuValue[0]) !== 0)
				d.gpuValue_normalized = ((d.gpuValue - extentGpuValue[0]) * (table_attr[7].w - stackT.minLength) / (extentGpuValue[1] - extentGpuValue[0]) + stackT.minLength).toFixed(2);
		});

		// 生成 Stacked Bar 座標點
		const stackGenerator = d3.stack().keys(stackT.keys);
		let stackData = stackGenerator(allData[0]);
		// console.log(stackData);

		allData[0].forEach((d, i) => {
			d.stackData = [
				[ stackData[0][i][0], stackData[0][i][1] ],
				[ stackData[1][i][0], stackData[1][i][1] ],
				[ stackData[2][i][0], stackData[2][i][1] ],
				[ stackData[3][i][0], stackData[3][i][1] ],
			];
		});

		// 建立 Stacked Bar 的容器
		let stackG= divTableBody.select("svg")
			.append("g")
			.attr("id", "stacked-bar-chart")
			.attr("transform", `translate(${stackT.FLeftTopX + stackT.MARGIN.LEFT}, ${stackT.FLeftTopY + stackT.MARGIN.TOP})`);

		// 繪製 Stacked Bar 的 Rows
		let stackRows = stackG.selectAll(".table_bar_g")
			.data(allData[0])
			.join("g")  // 每個 Row 為一個 Group
			.attr("class", "table_bar_g")
			.attr("transform", (d, i) => {
				let x = 0;
				if (stackT.alignment < 4)
					x = table_attr[stackT.alignment + 4].x - d.stackData[stackT.alignment][0];
				else
					x = table_attr[7].x + table_attr[7].w - d.stackData[stackT.alignment - 1][1];
				return `translate(${x}, ${(d["id"]-1) * stackT.rowHeight})`;
			});
		stackRows.each(function(d, rowIndex) {
			d3.select(this).selectAll("rect")
				.data(stackT.keys).enter().append("rect")
				.attr("x", (_, columnIndex) => d.stackData[columnIndex][0])
				.attr("y", (stackT.rowHeight - stackT.barHeight) / 2)
				.attr("width", (_, columnIndex) => d.stackData[columnIndex][1] - d.stackData[columnIndex][0])
				.attr("height", stackT.barHeight)
				.attr("fill", (_, i) => stackT.fillColor[i])
				.append("title")
				.text((_, i) => d[table_attr[4+i]["attr"]]);
		});

		function stackViewUpdate() {
			// 更新 Stacked Bar 座標點
			// stackData = stackGenerator(cdata);
			// 更新 Stacked Bar 的 Rows
			stackRows = stackG.selectAll(".table_bar_g")
				.data(allData[0])
				.filter(d => d["id"] <= cdata.length)
				.transition().duration(1000)
				.attr("transform", (d, i) => {
					let x = 0;
					if (stackT.alignment < 4)
						x = table_attr[stackT.alignment + 4].x - d.stackData[stackT.alignment][0];
					else
						x = table_attr[7].x + table_attr[7].w - d.stackData[stackT.alignment - 1][1];
					return `translate(${x}, ${(d["id"]-1) * stackT.rowHeight})`;
				});
		}

		//====================
		// 繪製 Align Buttons
		//====================
		typesettings["alignButton"] = {};
		const alignT = typesettings["alignButton"];
		alignT.points = [ [-5, 0], [0, 10], [5, 0] ];  // 倒三角形的局部座標點
		alignT.fillColor = [ "white", "grey", "black" ];  // 未選中, 未選中滑過, 選中
		alignT.stroke = d3.rgb(0, 0, 0);  // 線條顏色
		alignT.strokeWidth = 0.3;  // 線條粗細

		// 建立 Align Buttons 的容器
		const alignG = svg.append("g")
			.attr("id", "align-button")
			.attr("transform", `translate(${tableT.FLeftTopX + tableT.MARGIN.LEFT}, ${tableT.FLeftTopY + tableT.MARGIN.TOP})`);

		// 繪製 Align Buttons 的倒三角形
		alignG.append("g").selectAll("polygon")
			.data([0, 1, 2, 3, 4])  // 繪製 5 次
			.enter().append("polygon")
			.attr("points", alignT.points)
			.attr("fill", (d, i) => i !== stackT.alignment ? alignT.fillColor[0] : alignT.fillColor[2])
			.attr("stroke", alignT.stroke)
			.attr("stroke-width", alignT.strokeWidth)
			.attr("transform", (d, i) => `translate(${table_attr[i + 3].x + table_attr[i + 3].w}, -10)`)
			.on("mouseover", function (_, i) {  // 游標滑過變顏色
				d3.select(this)
					.attr("fill", d => (i !== stackT.alignment ? alignT.fillColor[1] : alignT.fillColor[2]));
			})
			.on("mouseout", function (_, i) {  // 游標移走恢復顏色
				d3.select(this)
					.attr("fill", d => (i !== stackT.alignment ? alignT.fillColor[0] : alignT.fillColor[2]));
			})
			.on("click", function (_, i) {
				stackT.alignment = i;
				stackViewUpdate();
				alignViewUpdate();
			})
			.style("cursor", "pointer");

		function alignViewUpdate() {
			alignG.selectAll("polygon")
				.data([0, 1, 2, 3, 4])  // 繪製 5 次
				.join("polygon")
				.attr("fill", (_, i) => i !== stackT.alignment ? alignT.fillColor[0] : alignT.fillColor[2]);
		}

		//======================
		// 繪製 Sorting Buttons
		//======================
		typesettings["sortingButton"] = {};
		const sortT = typesettings["sortingButton"];
		sortT.points = [  // 三角形的局部座標點
			[[-3, 0], [0, 6], [3, 0]],  // 倒三角形
			[[-3, 6], [0, 0], [3, 6]],  // 正三角形
		];
		sortT.fillColor = [ "transparent", "black" ];  // 未選中, 選中
		sortT.colAdjust = [ 90, 12, 16, 45, 35, 35, 49 ];

		// 建立 Sorting Buttons 的容器
		const sortG = svg.append("g")
			.attr("id", "sorting-button")
			.attr("transform", `translate(${tableT.FLeftTopX + tableT.MARGIN.LEFT}, ${tableT.FLeftTopY + tableT.MARGIN.TOP})`)
			.append("g");

		// 繪製 Sorting Buttons 的三角形
		sortG.selectAll("polygon")
			.data([0, 1, 2, 3, 4, 5, 6])  // 繪製 7 次
			.enter().append("polygon")
			.attr("points", conds["descend"] === true ? sortT.points[0] : sortT.points[1])
			.attr("fill", (_, i) => (i !== conds["sort_id"] - 1) ? sortT.fillColor[0] : sortT.fillColor[1])
			.attr("transform", (d, i) => `translate(${table_attr[i + 1].x + sortT.colAdjust[i]}, ${tableT.rowHeight[0] * 0.35})`);

		function sortButtonHandler(event, d) {
			i = table_attr.indexOf(d);
			if (i === conds["sort_id"])
				conds["descend"] = !conds["descend"];
			else
				conds["sort_id"] = i;

			sort_table(event);
			sortViewUpdate();
			// stackViewUpdate();
		}

		function sortViewUpdate() {
			sortG.selectAll("polygon")
				.data([0, 1, 2, 3, 4, 5, 6])
				.join("polygon")
				.attr("points", conds["descend"] === true ? sortT.points[0] : sortT.points[1])
				.attr("fill", (_, i) => (i !== conds["sort_id"] - 1) ? sortT.fillColor[0] : sortT.fillColor[1])
				.attr("transform", (d, i) => `translate(${table_attr[i + 1].x + sortT.colAdjust[i]}, ${tableT.rowHeight[0] * 0.35})`);
		}
	}

	function update_data(event){

		// Clear Data
		cdata = [];
		let edata = [];
		manuf_counter.fill(0);

		const con_manuf_max  = Math.max(...conds["manuf"]);
		let new_highlight_id = 0;
		allData[0].forEach(d => {
			let is_highlight_id = d["id"] == conds["highlight_id"];
			d["id"] = 0;
			const is_manuf = con_manuf_max == -1 || conds["manuf"][manuf_text[d["manufacturer"]]] == 1;
			function is_attr(){
				const p = conds["parallel"];
				for(let i = 0; i < parallel_size-1; ++i){
					if(d[parallel_name[i]] == 0)      { return false; }
					if(d[parallel_name[i]] < p[i*2])  { return false; }
					if(d[parallel_name[i]] > p[i*2+1]){ return false; }
				}
				return true;
			};
			if(is_manuf && is_attr()){
				manuf_counter[manuf_text[d["manufacturer"]]] += 1;
				d["id"] = cdata.length + 1;
				cdata.push(d);
			}
			else
			{
				d["id"] = allData[0].length - edata.length;
				edata.push(d);
			}
			if(is_highlight_id){ new_highlight_id = d["id"]; }
		});
		parallel_attr[parallel_size-1]["min"] = cdata.length;
		parallel_attr[parallel_size-1]["max"] = Math.min(1, cdata.length);

		// Change Highlight ID
		conds["highlight_id"] = new_highlight_id;

		const ms = Math.trunc((1 - Math.min(1, cdata.length * 0.001)) * 1000);

		// Donut Chart
		{
			const t = typesettings["dount"];

			const g = d3.select("#donut");

			// Color
			g.selectAll("rect")
			 .attr("stroke", (d, i) => conds["manuf"][i] == 1 ? "black" : "none");

			// Donut
			let manuf_counter_sum = 0;
			let manuf_counter_sdf = manuf_counter;
			if(con_manuf_max == -1){
				manuf_counter_sum = Math.max(1, manuf_counter.reduce((sum, value) => sum + value));
				for(let i = 1; i < manuf_size; ++i){ manuf_counter_sdf[i] += manuf_counter_sdf[i-1]; }
			}
			else{
				for(let i = 0; i < manuf_size; ++i){
					if(conds["manuf"][i] == -1){
						manuf_counter_sdf[i] = 0;
						continue;
					}
					manuf_counter_sum += manuf_counter_sdf[i];
					manuf_counter_sdf[i] = manuf_counter_sum;
				}
			}
			manuf_counter_sum = Math.max(1, manuf_counter_sum);
			const arcGenerator = d3.arc().innerRadius(t.DInnerR).outerRadius(t.DOuterR);
			g.selectAll("path")
			 .transition()
			 .duration(ms)
			 .attrTween("d", (d, i) => {
				 const pre_angle = d3.select("#donut_path_" + (manuf_size-1-i)).attr("my_attr_end_angle");
				 const end_angle = (manuf_counter_sdf[manuf_size-1-i] / manuf_counter_sum) * 2 * Math.PI;
				 const end_angle_interpolate = d3.interpolate(pre_angle, end_angle);
				 return t => {
					 arcGenerator.endAngle(end_angle_interpolate(t));
					 return arcGenerator(d);
				 };
			 })
			 .attr("my_attr_end_angle", (d, i) => (manuf_counter_sdf[manuf_size-1-i] / manuf_counter_sum) * 2 * Math.PI);
		}

		// Parallel Coordinate Plot
		{
			const t = typesettings["parallel"];

			const g = d3.select("#parallel");

			// X & Y Scales
			const xScale = d3.scalePoint()
							 .domain(parallel_name)
							 .range([0, (t.BWidth + t.BMargin) * (parallel_size - 1)]);
			const yScales = {};
			for(let i = 0; i < parallel_size; ++i){
				const yScale = d3.scaleLinear()
								 .domain([parallel_attr[i]["max"], parallel_attr[i]["min"]])
								 .range([0, t.BHeight]);
				yScales[parallel_name[i]] = yScale;
			}

			// Y Axis of ID
			g.select("#parallel_"+(parallel_size-1)+"_axis")
			 .transition()
			 .duration(ms)
			 .call(d3.axisLeft(yScales[parallel_name[parallel_size-1]]).ticks(Math.min(20, cdata.length)).tickSize(2));

			// Paths
			const color = d3.scaleOrdinal()
							.domain(Array.from(Array(manuf_size).keys()))
							.range(d3.schemeCategory10);
			function path(d) {
				const lines = Array(parallel_size*2).fill().map((d, i) => parallel_name[Math.trunc(i/2)]);
				return d3.line()(lines.map((p, i) => {
					const f = (i/2) % 1 != 0;
					const x = xScale(p) + t.BLeftTopX + (f ? t.BWidth : 0);
					const y = yScales[p](d[p]) + t.BLeftTopY;
					return [x, y];
				}));
			}
			g.selectAll(".parallel_attr_path")
			 .data(cdata)
			 .join(
				enter => enter.transition()
							  .duration(ms)
							  .attr("d", path)
							  .attr("class", d => "parallel_attr_path my_id_"+d["id"])
							  .attr("stroke", d => color(manuf_text[d["manufacturer"]]))
							  .attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
				update => update.transition()
								.duration(ms)
								.attr("d", path)
								.attr("class", d => "parallel_attr_path my_id_"+d["id"])
								.attr("stroke", d => color(manuf_text[d["manufacturer"]]))
								.attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
				exit => exit.transition()
							.duration(ms)
							.attr("class", d => "parallel_attr_path my_id_"+d["id"])
							.attr("stroke", "none")
							.attr("stroke-width", 1)
			 );
		}

		// Histogram
		{
			const t = typesettings["histogram"];

			const g = d3.select("#histogram");

			for(let i = 0; i < histogram_size; ++i){
				const a = histogram_attr[i];
				const bins = a["histogram"](cdata);
				const xScale = d3.scaleLinear()
								 .domain([a["min"], a["max"]])
								 .range([0, t.HWidth]);
				const yScale = d3.scaleLinear()
								 .domain([a["max_counter"], 0])
								 .range([0, t.HHeight]);

				// Rectangles
				g.select("#histogram_"+a["attr"]+"_g")
				 .selectAll(".histogram_bin_rect")
				 .data(bins)
				 .transition()
				 .duration(1000)
				 .attr("transform", d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
				 .attr("height", d => t.HHeight - yScale(d.length));

				// Tooltips
				g.select("#histogram_"+a["attr"]+"_g")
				 .selectAll("title")
				 .data(bins)
				 .text((d, i) => d.length + "/" + a["counter"][i]);
			}

			// Data Size Text
			g.select("#histogram_data_size_text")
			 .text(`find ${cdata.length} data (total ${allData[0].length} data in our dataset)`);
		}

		//==================
		// 更新 Table 的視圖
		//==================
		{
			const tableT = typesettings["table"];
			const svgTableBody = d3.select("#table-body-svg");

			// 更新每個 Row 的位置
			svgTableBody.selectAll(".table_item_g")
				.data(allData[0])
				.transition().duration(ms)
				.attr("transform", d => `translate(0, ${(d["id"]-1) * tableT.rowHeight[1]})`)
				.attr("visibility", d => d["id"] <= cdata.length ? "visible" : "hidden")
				// 被選中的 Row 高光顯示
				.selectAll("rect")
				.attr("fill", d => d["id"] == conds["highlight_id"] ? "yellow" : "white");

			// 依據選取項目多寡調整 SVG 長度
			svgTableBody.transition().duration(500)
				.attr("height", tableT.rowHeight[1] * cdata.length);

			const stackT = typesettings["stackedBar"];

			svgTableBody.selectAll(".table_bar_g")
				.data(allData[0])
				.transition().duration(ms)
				.attr("transform", (d, i) => {
					let x = 0;
					if (stackT.alignment < 4)
						x = table_attr[stackT.alignment + 4].x - d.stackData[stackT.alignment][0];
					else
						x = table_attr[7].x + table_attr[7].w - d.stackData[stackT.alignment - 1][1];
					return `translate(${x}, ${(d["id"]-1) * stackT.rowHeight})`;
				})
				.attr("visibility", d => d["id"] <= cdata.length ? "visible" : "hidden");

			// 更新 ID 欄位的編號
			svgTableBody.selectAll(".table_" + table_attr[0]["attr"] + "_text")
				.data(allData[0])
				.text(d => d[table_attr[0]["attr"]]);

			// Highlight ID Text
			d3.select("#table_highlight_id_text")
			  .text("Highlight ID : " + (conds["highlight_id"] > 0 ?
										 (conds["highlight_id"] <= cdata.length ? conds["highlight_id"] : "not in list") :
										 "none"));
		}

		// Sort
		if(conds["sort_id"] > 0){ sort_table(event); }

		debug_console("update_data");
	}

	function sort_table(event) {
		if(conds["sort_id"] > 0){

			const ms = Math.trunc((1 - Math.min(1, cdata.length * 0.001)) * 1000);

			// Table (Stacked Bar Chart)
			{
				cdata.sort((a, b) => {
					const x = a[table_attr[conds["sort_id"]]["attr"]];
					const y = b[table_attr[conds["sort_id"]]["attr"]];
					if (typeof x === 'string') {
						return (conds["descend"] ? y.localeCompare(x) : x.localeCompare(y));
					} else {
						return (conds["descend"] ? y - x : x - y);
					}
				});
				const m = Array(cdata.length+1).fill(0);
				cdata.forEach((d, i) => {
					m[d["id"]] = i+1;
				});

				// Change Highlight ID
				if(conds["highlight_id"] <= cdata.length){ conds["highlight_id"] = m[conds["highlight_id"]]; }

				const tableT = typesettings["table"];
				const svgTableBody = d3.select("#table-body-svg");

				// 更新每個 Row 的位置
				svgTableBody.selectAll(".table_item_g")
					.data(allData[0])
					.filter(d => d["id"] <= cdata.length)
					.transition().duration(ms)
					.attr("transform", d => `translate(0, ${(m[d["id"]]-1) * tableT.rowHeight[1]})`);

				// 依據選取項目多寡調整 SVG 長度
				svgTableBody.transition().duration(500)
					.attr("height", tableT.rowHeight[1] * cdata.length);

				const stackT = typesettings["stackedBar"];

				svgTableBody.selectAll(".table_bar_g")
					.data(allData[0])
					.filter(d => d["id"] <= cdata.length)
					.transition().duration(ms)
					.attr("transform", (d, i) => {
						let x = 0;
						if (stackT.alignment < 4)
							x = table_attr[stackT.alignment + 4].x - d.stackData[stackT.alignment][0];
						else
							x = table_attr[7].x + table_attr[7].w - d.stackData[stackT.alignment - 1][1];
						return `translate(${x}, ${(m[d["id"]]-1) * stackT.rowHeight})`;
					});

				allData[0].forEach((d, i) => {
					if (d["id"] <= cdata.length) {
						d["id"] = m[d["id"]];
					};
				});

				// 更新 ID 欄位的編號
				svgTableBody.selectAll(".table_" + table_attr[0]["attr"] + "_text")
					.data(allData[0])
					.text(d => d[table_attr[0]["attr"]]);

				// Highlight ID Text
				d3.select("#table_highlight_id_text")
				  .text("Highlight ID : " + (conds["highlight_id"] > 0 ?
											(conds["highlight_id"] <= cdata.length ? conds["highlight_id"] : "not in list") :
											"none"));
			}

			// Parallel Coordinate Plot
			{
				const t = typesettings["parallel"];

				const g = d3.select("#parallel");

				// X & Y Scales
				const xScale = d3.scalePoint()
								 .domain(parallel_name)
								 .range([0, (t.BWidth + t.BMargin) * (parallel_size - 1)]);
				const yScales = {};
				for(let i = 0; i < parallel_size; ++i){
					const yScale = d3.scaleLinear()
									 .domain([parallel_attr[i]["max"], parallel_attr[i]["min"]])
									 .range([0, t.BHeight]);
					yScales[parallel_name[i]] = yScale;
				}

				// Paths
				const color = d3.scaleOrdinal()
								.domain(Array.from(Array(manuf_size).keys()))
								.range(d3.schemeCategory10);
				function path(d) {
					const lines = Array(parallel_size*2).fill().map((d, i) => parallel_name[Math.trunc(i/2)]);
					return d3.line()(lines.map((p, i) => {
						const f = (i/2) % 1 != 0;
						const x = xScale(p) + t.BLeftTopX + (f ? t.BWidth : 0);
						const y = yScales[p](d[p]) + t.BLeftTopY;
						return [x, y];
					}));
				}
				g.selectAll(".parallel_attr_path")
				 .data(cdata)
				 .join(
					enter => enter.transition()
								  .duration(ms)
								  .attr("d", path)
								  .attr("class", d => "parallel_attr_path my_id_"+d["id"])
								  .attr("stroke", d => color(manuf_text[d["manufacturer"]]))
								  .attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
					update => update.transition()
									.duration(ms)
									.attr("d", path)
									.attr("class", d => "parallel_attr_path my_id_"+d["id"])
									.attr("stroke", d => color(manuf_text[d["manufacturer"]]))
									.attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
					exit => exit.transition()
								.duration(ms)
								.attr("class", d => "parallel_attr_path my_id_"+d["id"])
								.attr("stroke", "none")
								.attr("stroke-width", 1)
				 );
			}
		}

		debug_console("sort_table");
	}

	function highlight_data(event) {

		const ms = Math.trunc((1 - Math.min(1, cdata.length * 0.001)) * 1000);

		// Parallel Coordinate Plot
		{
			const t = typesettings["parallel"];

			const g = d3.select("#parallel");

			g.selectAll(".parallel_attr_path")
			 .transition()
			 .duration(ms)
			 .attr("stroke-width", 1);

			if(conds["highlight_id"] > 0)
			{
				g.select(".my_id_"+conds["highlight_id"])
				 .transition()
				 .duration(ms)
				 .attr("stroke-width", 10);
			}
		}

		// Histogram
		{
			const t = typesettings["histogram"];

			const g = d3.select("#histogram");

			for(let i = 0; i < histogram_size; ++i){
				const a = histogram_attr[i];
				g.select("#histogram_"+a["attr"]+"_g")
				 .selectAll(".histogram_bin_border_rect")
				 .attr("stroke", "black");
			}

			if(conds["highlight_id"] > 0){
				for(let i = 0; i < histogram_size; ++i){
					const a = histogram_attr[i];
					const j = a["histogram"]([cdata[conds["highlight_id"]-1]]).map(d => d.length).indexOf(1);
					g.select(".histogram_"+a["attr"]+"_bin_border_"+j)
					 .attr("stroke", "red");
				}
			}
		}

		//==================
		// 更新 Table 的視圖
		//==================
		{
			const tableT = typesettings["table"];

			// Highlight ID Text
			d3.select("#table_highlight_id_text")
			  .text("Highlight ID : " + (conds["highlight_id"] > 0 ? conds["highlight_id"] : "none"));

			// 依據選取項目多寡調整 SVG 長度
			const svgTableBody = d3.select("#table-body-svg")
				.attr("height", tableT.rowHeight[1] * cdata.length);

			// 被選中的 Row 高光顯示
			svgTableBody.selectAll(".table_item_g")
				.data(allData[0])
				.filter(d => d["id"] <= cdata.length)
				.selectAll("rect")
				.transition().duration(Math.min(100, ms))
				.attr("fill", d => d["id"] === conds["highlight_id"] ? "yellow" : "white");
		}

		debug_console("highlight_data");
	}

	function sort_attr(event, fid, tid) {

		const ms = Math.trunc((1 - Math.min(1, cdata.length * 0.001)) * 1000);

		// Data
		{
			let a = parallel_attr[tid];
			let n = parallel_name[tid];
			let c = [conds["parallel"][tid*2], conds["parallel"][tid*2+1]];
			parallel_attr[tid] = parallel_attr[fid];
			parallel_name[tid] = parallel_name[fid];
			conds["parallel"][tid*2]   = conds["parallel"][fid*2];
			conds["parallel"][tid*2+1] = conds["parallel"][fid*2+1];
			parallel_attr[fid] = a;
			parallel_name[fid] = n;
			conds["parallel"][fid*2]   = c[0];
			conds["parallel"][fid*2+1] = c[1];
		}

		// Parallel Coordinate Plot
		{
			const t = typesettings["parallel"];

			const g = d3.select("#parallel");

			// Texts
			g.selectAll(".parallel_attr_text")
			 .data(parallel_attr)
			 .transition()
			 .duration(ms)
			 .text(d => d["text"]);

			// X & Y Scales
			const xScale = d3.scalePoint()
							 .domain(parallel_name)
							 .range([0, (t.BWidth + t.BMargin) * (parallel_size - 1)]);
			const yScales = {};
			for(let i = 0; i < parallel_size; ++i){
				const yScale = d3.scaleLinear()
								 .domain([parallel_attr[i]["max"], parallel_attr[i]["min"]])
								 .range([0, t.BHeight]);
				yScales[parallel_name[i]] = yScale;
			}

			// Paths
			const color = d3.scaleOrdinal()
							.domain(Array.from(Array(manuf_size).keys()))
							.range(d3.schemeCategory10);
			function path(d) {
				const lines = Array(parallel_size*2).fill().map((d, i) => parallel_name[Math.trunc(i/2)]);
				return d3.line()(lines.map((p, i) => {
					const f = (i/2) % 1 != 0;
					const x = xScale(p) + t.BLeftTopX + (f ? t.BWidth : 0);
					const y = yScales[p](d[p]) + t.BLeftTopY;
					return [x, y];
				}));
			}
			g.selectAll(".parallel_attr_path")
			 .data(cdata)
			 .join(
				enter => enter.transition()
							  .duration(ms)
							  .attr("d", path)
							  .attr("class", d => "parallel_attr_path my_id_"+d["id"])
							  .attr("stroke", d => color(manuf_text[d["manufacturer"]]))
							  .attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
				update => update.transition()
								.duration(ms)
								.attr("d", path)
								.attr("class", d => "parallel_attr_path my_id_"+d["id"])
								.attr("stroke", d => color(manuf_text[d["manufacturer"]]))
								.attr("stroke-width", d => d["id"] == conds["highlight_id"] ? 10 : 1),
				exit => exit.transition()
							.duration(ms)
							.attr("class", d => "parallel_attr_path my_id_"+d["id"])
							.attr("stroke", "none")
							.attr("stroke-width", 1)
			 );

			for(let i = 0; i < parallel_size; ++i){
				if(i == fid || i == tid){
					// Y Axis
					const yScale = yScales[parallel_name[i]];
					const yAxis = d3.axisLeft(yScale)
									.ticks(20)
									.tickSize(2);
					g.select("#parallel_"+i+"_axis")
					 .transition()
					 .duration(ms)
					 .call(yAxis);

					if(i == parallel_size-1) { break; }

					// Brush
					function brushed(event) {
						let extent = event.selection;
						conds["parallel"][i*2]   = yScale.invert(extent[1] - t.BLeftTopY);
						conds["parallel"][i*2+1] = yScale.invert(extent[0] - t.BLeftTopY);
						parallel_attr[i]["selection"] = extent;
					}
					function refresh(event) {
						let extent = event.selection;
						if(extent[0] == extent[1])
						{
							conds["parallel"][i*2]   = parallel_attr[i]["min"];
							conds["parallel"][i*2+1] = parallel_attr[i]["max"];
						}
						parallel_attr[i]["selection"] = extent;
					}
					const brush = d3.brushY()
									.extent([[t.BLeftTopX + i * (t.BWidth + t.BMargin),            t.BLeftTopY],
											 [t.BLeftTopX + i * (t.BWidth + t.BMargin) + t.BWidth, t.BLeftTopY + t.BHeight]])
									.on("start", refresh)
									.on("brush", brushed)
									.on("end",   update_data);
					if(parallel_attr[i]["selection"][0] != parallel_attr[i]["selection"][1]){
						g.select("#parallel_"+i+"_brush")
						 .call(brush)
						 .call(brush.move, parallel_attr[i]["selection"]);
					}
					else{
						g.select("#parallel_"+i+"_brush")
						 .call(d3.brushY().clear)
						 .call(brush);
					}
				}
			}
		}

		debug_console("sort_attr");
	}

	function debug_console(f){
		console.log(f);
		console.log("now data size :", cdata.length);
		console.log("highlight id :", conds["highlight_id"]);
	}
})
.catch(function(error) { console.log(error); });