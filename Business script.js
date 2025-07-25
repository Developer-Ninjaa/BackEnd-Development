(function executeRule(current, previous /*null when insert*/) {
    var rm = new sn_ws.RESTMessageV2('Send Contract to MuleSoft', 'post');

    var contractPayload = {
        short_description: current.short_description.toString(),
        start_date: current.start_date.toString(),
        end_date: current.end_date.toString(),
        terms: current.terms.toString()
    };

    rm.setRequestBody(JSON.stringify(contractPayload));

    try {
        var response = rm.execute();
        var responseBody = response.getBody();
        var status = response.getStatusCode();

        gs.info('MuleSoft response status: ' + status + ' body: ' + responseBody);
    } catch (ex) {
        gs.error('Error calling MuleSoft: ' + ex.message);
    }
})(current, previous);
