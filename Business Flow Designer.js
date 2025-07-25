(function executeRule(current, gsn) {
    var rm = new sn_ws.RESTMessageV2('Send Contract to Coupa', 'post');

    var body = {
        name: current.short_description.toString(),
        start_date: current.start_date.toString(),
        end_date: current.end_date.toString(),
        status: 'draft',
        description: current.terms.toString()
    };

    rm.setRequestBody(JSON.stringify(body));
    var response = rm.execute();

    var responseBody = response.getBody();
    var httpStatus = response.getStatusCode();
})();
