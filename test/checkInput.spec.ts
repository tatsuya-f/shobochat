import { equal } from 'assert';
import { checkInput } from '../src/public/js/MessageFunctions';
		describe('checkInput', function() {
			describe('#checkInput(a: string)', function() {
				it('should return true when input is ABC', function() {
				equal(checkInput("ABC"), true);
			});
				it('should return true when input is DEFG', function() {
				equal(checkInput("DEFG"), true);
			});	
				it('should return false when input is empty', function() {
				equal(checkInput(""), false);
			});	
				it('should return false when input is "   "(3 spaces)', function() {
				equal(checkInput("   "), false);
			});	
				it('should return false when input is "		"(two tabs)', function() {
				equal(checkInput("		"), false);
			});	
				it('should return false when input is "   		"(3 spaces and two tabs)', function() {
				equal(checkInput("   		"), false);
			});	
				it('should return true when input is "a   "(3 spaces)', function() {
				equal(checkInput("a   "), true);
			});	
				it('should return true when input is "	b	"(two tabs)', function() {
				equal(checkInput("	b	"), true);
			});	
				it('should return true when input is "   		c"(3 spaces and two tabs)', function() {
				equal(checkInput("   		c"), true);
			});				
	});
});
