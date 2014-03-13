(function($) {
  
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

})(jQuery)