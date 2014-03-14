rdb_eval = (function($) {
  
  $('#addCustomer').click(function() {
    if ( $('#customerForm').is('.inactive') ) {
      $('#addCustomer').html('cancel');
      $('#customerForm').removeClass('inactive');
    } else {
      resetForm();
    }
  })

  function resetForm() {
    $('#addCustomer').html('+ Add Customer');
    $('#customerForm input').val('');
    $('#customerForm').addClass('inactive');      
  }

  $('#customerForm').submit(function(e) {
    e.preventDefault();
    $.post('/customer', $('#customerForm').serialize(), addResponse);

    return false;
  })

  function addResponse(result) {
    console.log(result, result.address);
    $('#customerTable tbody').prepend('<tr data-id="'+result.id+'"><td>'+result.firstName+' ' + result.lastName+'</td>'+
      '<td>'+result.address.zip+'</td>'+
      '<td>'+result.email+'</td>'+
      '<td><span class="purchases">0</span> <button class="btn btn-xs btn-primary add">+ add</button></td>' +
      '<td><button class="btn btn-xs btn-danger delete">delete</button></td></tr>'
      );
    resetForm();
  }

  $('#customerTable').on('click', 'button.delete', function(e) {
    e.preventDefault();

    var id = $(this).closest('tr').data('id');
    $.post('/customer/' + id + '/delete', function() {
      $('tr[data-id="'+id+'"]').remove();
    })
  })

  $('#customerTable').on('click', 'button.add', function(e) {
    e.preventDefault();

    var id = $(this).closest('tr').data('id');
    $.post('/customer/' + id + '/add-purchase', function(result) {
      $('tr[data-id="'+id+'"] .purchases').html( result.purchases.length );
    })
  })

  function visualizeProductsByZip() {
  //State,Under 5 Years,5 to 13 Years,14 to 17 Years,18 to 24 Years,25 to 44 Years,45 to 64 Years,65 Years and Over
    var data = [{State:'AL', 'Under 5 Years':310504, '5 to 13 Years':552339, '14 to 17 Years':259034, '18 to 24 Years':450818, '25 to 44 Years':1231572, '45 to 64 Years':1215966, '64 Years and Over':1215966},
      {State:'AK', 'Under 5 Years':52083, '5 to 13 Years':85640, '14 to 17 Years':42153, '18 to 24 Years':74257, '25 to 44 Years':198724, '45 to 64 Years':183159, '64 Years and Over':183159},
      {State:'AZ', 'Under 5 Years':515910, '5 to 13 Years':828669, '14 to 17 Years':362642, '18 to 24 Years':601943, '25 to 44 Years':1804762, '45 to 64 Years':1523681, '64 Years and Over':1523681},
      {State:'AR', 'Under 5 Years':202070, '5 to 13 Years':343207, '14 to 17 Years':157204, '18 to 24 Years':264160, '25 to 44 Years':754420, '45 to 64 Years':727124, '64 Years and Over':727124},
      {State:'CA', 'Under 5 Years':2704659, '5 to 13 Years':4499890, '14 to 17 Years':2159981, '18 to 24 Years':3853788, '25 to 44 Years':10604510, '45 to 64 Years':8819342, '64 Years and Over':8819342},
      {State:'CO', 'Under 5 Years':358280, '5 to 13 Years':587154, '14 to 17 Years':261701, '18 to 24 Years':466194, '25 to 44 Years':1464939, '45 to 64 Years':1290094, '64 Years and Over':1290094},
      {State:'CT', 'Under 5 Years':211637, '5 to 13 Years':403658, '14 to 17 Years':196918, '18 to 24 Years':325110, '25 to 44 Years':916955, '45 to 64 Years':968967, '64 Years and Over':968967},
      {State:'DE', 'Under 5 Years':59319, '5 to 13 Years':99496, '14 to 17 Years':47414, '18 to 24 Years':84464, '25 to 44 Years':230183, '45 to 64 Years':230528, '64 Years and Over':230528},
      {State:'DC', 'Under 5 Years':36352, '5 to 13 Years':50439, '14 to 17 Years':25225, '18 to 24 Years':75569, '25 to 44 Years':193557, '45 to 64 Years':140043, '64 Years and Over':140043},
      {State:'FL', 'Under 5 Years':1140516, '5 to 13 Years':1938695, '14 to 17 Years':925060, '18 to 24 Years':1607297, '25 to 44 Years':4782119, '45 to 64 Years':4746856, '64 Years and Over':4746856},
      {State:'GA', 'Under 5 Years':740521, '5 to 13 Years':1250460, '14 to 17 Years':557860, '18 to 24 Years':919876, '25 to 44 Years':2846985, '45 to 64 Years':2389018, '64 Years and Over':2389018},
      {State:'HI', 'Under 5 Years':87207, '5 to 13 Years':134025, '14 to 17 Years':64011, '18 to 24 Years':124834, '25 to 44 Years':356237, '45 to 64 Years':331817, '64 Years and Over':331817},
      {State:'ID', 'Under 5 Years':121746, '5 to 13 Years':201192, '14 to 17 Years':89702, '18 to 24 Years':147606, '25 to 44 Years':406247, '45 to 64 Years':375173, '64 Years and Over':375173},
      {State:'IL', 'Under 5 Years':894368, '5 to 13 Years':1558919, '14 to 17 Years':725973, '18 to 24 Years':1311479, '25 to 44 Years':3596343, '45 to 64 Years':3239173, '64 Years and Over':3239173},
      {State:'IN', 'Under 5 Years':443089, '5 to 13 Years':780199, '14 to 17 Years':361393, '18 to 24 Years':605863, '25 to 44 Years':1724528, '45 to 64 Years':1647881, '64 Years and Over':1647881},
      {State:'IA', 'Under 5 Years':201321, '5 to 13 Years':345409, '14 to 17 Years':165883, '18 to 24 Years':306398, '25 to 44 Years':750505, '45 to 64 Years':788485, '64 Years and Over':788485},
      {State:'KS', 'Under 5 Years':202529, '5 to 13 Years':342134, '14 to 17 Years':155822, '18 to 24 Years':293114, '25 to 44 Years':728166, '45 to 64 Years':713663, '64 Years and Over':713663},
      {State:'KY', 'Under 5 Years':284601, '5 to 13 Years':493536, '14 to 17 Years':229927, '18 to 24 Years':381394, '25 to 44 Years':1179637, '45 to 64 Years':1134283, '64 Years and Over':1134283},
      {State:'LA', 'Under 5 Years':310716, '5 to 13 Years':542341, '14 to 17 Years':254916, '18 to 24 Years':471275, '25 to 44 Years':1162463, '45 to 64 Years':1128771, '64 Years and Over':1128771},
      {State:'ME', 'Under 5 Years':71459, '5 to 13 Years':133656, '14 to 17 Years':69752, '18 to 24 Years':112682, '25 to 44 Years':331809, '45 to 64 Years':397911, '64 Years and Over':397911},
      {State:'MD', 'Under 5 Years':371787, '5 to 13 Years':651923, '14 to 17 Years':316873, '18 to 24 Years':543470, '25 to 44 Years':1556225, '45 to 64 Years':1513754, '64 Years and Over':1513754},
      {State:'MA', 'Under 5 Years':383568, '5 to 13 Years':701752, '14 to 17 Years':341713, '18 to 24 Years':665879, '25 to 44 Years':1782449, '45 to 64 Years':1751508, '64 Years and Over':1751508},
      {State:'MI', 'Under 5 Years':625526, '5 to 13 Years':1179503, '14 to 17 Years':585169, '18 to 24 Years':974480, '25 to 44 Years':2628322, '45 to 64 Years':2706100, '64 Years and Over':2706100},
      {State:'MN', 'Under 5 Years':358471, '5 to 13 Years':606802, '14 to 17 Years':289371, '18 to 24 Years':507289, '25 to 44 Years':1416063, '45 to 64 Years':1391878, '64 Years and Over':1391878},
      {State:'MS', 'Under 5 Years':220813, '5 to 13 Years':371502, '14 to 17 Years':174405, '18 to 24 Years':305964, '25 to 44 Years':764203, '45 to 64 Years':730133, '64 Years and Over':730133},
      {State:'MO', 'Under 5 Years':399450, '5 to 13 Years':690476, '14 to 17 Years':331543, '18 to 24 Years':560463, '25 to 44 Years':1569626, '45 to 64 Years':1554812, '64 Years and Over':1554812},
      {State:'MT', 'Under 5 Years':61114, '5 to 13 Years':106088, '14 to 17 Years':53156, '18 to 24 Years':95232, '25 to 44 Years':236297, '45 to 64 Years':278241, '64 Years and Over':278241},
      {State:'NE', 'Under 5 Years':132092, '5 to 13 Years':215265, '14 to 17 Years':99638, '18 to 24 Years':186657, '25 to 44 Years':457177, '45 to 64 Years':451756, '64 Years and Over':451756},
      {State:'NV', 'Under 5 Years':199175, '5 to 13 Years':325650, '14 to 17 Years':142976, '18 to 24 Years':212379, '25 to 44 Years':769913, '45 to 64 Years':653357, '64 Years and Over':653357},
      {State:'NH', 'Under 5 Years':75297, '5 to 13 Years':144235, '14 to 17 Years':73826, '18 to 24 Years':119114, '25 to 44 Years':345109, '45 to 64 Years':388250, '64 Years and Over':388250},
      {State:'NJ', 'Under 5 Years':557421, '5 to 13 Years':1011656, '14 to 17 Years':478505, '18 to 24 Years':769321, '25 to 44 Years':2379649, '45 to 64 Years':2335168, '64 Years and Over':2335168},
      {State:'NM', 'Under 5 Years':148323, '5 to 13 Years':241326, '14 to 17 Years':112801, '18 to 24 Years':203097, '25 to 44 Years':517154, '45 to 64 Years':501604, '64 Years and Over':501604},
      {State:'NY', 'Under 5 Years':1208495, '5 to 13 Years':2141490, '14 to 17 Years':1058031, '18 to 24 Years':1999120, '25 to 44 Years':5355235, '45 to 64 Years':5120254, '64 Years and Over':5120254},
      {State:'NC', 'Under 5 Years':652823, '5 to 13 Years':1097890, '14 to 17 Years':492964, '18 to 24 Years':883397, '25 to 44 Years':2575603, '45 to 64 Years':2380685, '64 Years and Over':2380685},
      {State:'ND', 'Under 5 Years':41896, '5 to 13 Years':67358, '14 to 17 Years':33794, '18 to 24 Years':82629, '25 to 44 Years':154913, '45 to 64 Years':166615, '64 Years and Over':166615},
      {State:'OH', 'Under 5 Years':743750, '5 to 13 Years':1340492, '14 to 17 Years':646135, '18 to 24 Years':1081734, '25 to 44 Years':3019147, '45 to 64 Years':3083815, '64 Years and Over':3083815},
      {State:'OK', 'Under 5 Years':266547, '5 to 13 Years':438926, '14 to 17 Years':200562, '18 to 24 Years':369916, '25 to 44 Years':957085, '45 to 64 Years':918688, '64 Years and Over':918688},
      {State:'OR', 'Under 5 Years':243483, '5 to 13 Years':424167, '14 to 17 Years':199925, '18 to 24 Years':338162, '25 to 44 Years':1044056, '45 to 64 Years':1036269, '64 Years and Over':1036269},
      {State:'PA', 'Under 5 Years':737462, '5 to 13 Years':1345341, '14 to 17 Years':679201, '18 to 24 Years':1203944, '25 to 44 Years':3157759, '45 to 64 Years':3414001, '64 Years and Over':3414001},
      {State:'RI', 'Under 5 Years':60934, '5 to 13 Years':111408, '14 to 17 Years':56198, '18 to 24 Years':114502, '25 to 44 Years':277779, '45 to 64 Years':282321, '64 Years and Over':282321},
      {State:'SC', 'Under 5 Years':303024, '5 to 13 Years':517803, '14 to 17 Years':245400, '18 to 24 Years':438147, '25 to 44 Years':1193112, '45 to 64 Years':1186019, '64 Years and Over':1186019},
      {State:'SD', 'Under 5 Years':58566, '5 to 13 Years':94438, '14 to 17 Years':45305, '18 to 24 Years':82869, '25 to 44 Years':196738, '45 to 64 Years':210178, '64 Years and Over':210178},
      {State:'TN', 'Under 5 Years':416334, '5 to 13 Years':725948, '14 to 17 Years':336312, '18 to 24 Years':550612, '25 to 44 Years':1719433, '45 to 64 Years':1646623, '64 Years and Over':1646623},
      {State:'TX', 'Under 5 Years':2027307, '5 to 13 Years':3277946, '14 to 17 Years':1420518, '18 to 24 Years':2454721, '25 to 44 Years':7017731, '45 to 64 Years':5656528, '64 Years and Over':5656528},
      {State:'UT', 'Under 5 Years':268916, '5 to 13 Years':413034, '14 to 17 Years':167685, '18 to 24 Years':329585, '25 to 44 Years':772024, '45 to 64 Years':538978, '64 Years and Over':538978},
      {State:'VT', 'Under 5 Years':32635, '5 to 13 Years':62538, '14 to 17 Years':33757, '18 to 24 Years':61679, '25 to 44 Years':155419, '45 to 64 Years':188593, '64 Years and Over':188593},
      {State:'VA', 'Under 5 Years':522672, '5 to 13 Years':887525, '14 to 17 Years':413004, '18 to 24 Years':768475, '25 to 44 Years':2203286, '45 to 64 Years':2033550, '64 Years and Over':2033550},
      {State:'WA', 'Under 5 Years':433119, '5 to 13 Years':750274, '14 to 17 Years':357782, '18 to 24 Years':610378, '25 to 44 Years':1850983, '45 to 64 Years':1762811, '64 Years and Over':1762811},
      {State:'WV', 'Under 5 Years':105435, '5 to 13 Years':189649, '14 to 17 Years':91074, '18 to 24 Years':157989, '25 to 44 Years':470749, '45 to 64 Years':514505, '64 Years and Over':514505},
      {State:'WI', 'Under 5 Years':362277, '5 to 13 Years':640286, '14 to 17 Years':311849, '18 to 24 Years':553914, '25 to 44 Years':1487457, '45 to 64 Years':1522038, '64 Years and Over':1522038},
      {State:'WY', 'Under 5 Years':38253, '5 to 13 Years':60890, '14 to 17 Years':29314, '18 to 24 Years':53980, '25 to 44 Years':137338, '45 to 64 Years':147279, '64 Years and Over':147279}]
    $.getJSON('/products_by_zip/product_counts', function(data) { renderProductsByZip(data) });
//    renderProductsByZip(data);
  }

  function renderProductsByZip(data) {
    console.log("DATA", data)
    var radius = 74,
        padding = 10;

    var color = d3.scale.ordinal()
        .range(["#00A0B0", "#6A4A3C", "#CC333F", "#EB6841", "#EDC951", "#69D2E7", "#A7DBD8", "#E0E4CC", "#F38630", "#FA6900 "]);

    var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(radius - 30);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.count; });

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "zip"; }));

    data.forEach(function(d) {
      d.products = color.domain().map(function(name) {
        return {name: name, count: +d[name] || 0 };
      });
    });

    var legend = d3.select(".productsByZip").append("svg")
        .attr("class", "legend")
        .attr("width", radius * 3)
        .attr("height", radius * 4)
      .selectAll("g")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    var svg = d3.select(".productsByZip").selectAll(".pie")
        .data(data)
      .enter().append("svg")
        .attr("class", "pie")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    svg.selectAll(".arc")
        .data(function(d) { return pie(d.products); })
      .enter().append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    svg.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.zip; });

  }

  if ($('.productsByZip').length) {
    visualizeProductsByZip();
  }
})(jQuery)