/**
 * Created by Simon on 22/11/2014.
 */
module.exports.map = {
    async: function(example, done){
        setTimeout(function(){
            if (example.error){
                done('ERROR');
            }
            else {
                done(null, 5);
            }
        }, 200);
    }
}