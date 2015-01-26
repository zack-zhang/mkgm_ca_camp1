/**
    Configuration module 
*/
module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
            
        case 'testing':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
            
        case 'staging':
            return {
                
            };
            
        case 'production':
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/mkgm_ca_camp1"
            };
        default:
            return {
                dbConStr: "postgres://pguser:001@Helei@121.40.123.135/test_mkgm_ca_camp1"
            };
    }
};