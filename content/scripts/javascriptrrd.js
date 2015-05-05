
/*
 * BinaryFile over XMLHttpRequest
 * Part of the javascriptRRD package
 * Copyright (c) 2009 Frank Wuerthwein, fkw@ucsd.edu
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 *
 * Based on:
 *   Binary Ajax 0.1.5
 *   Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 *   MIT License [http://www.opensource.org/licenses/mit-license.php]
 */

// ============================================================
// Exception class
function InvalidBinaryFile(msg) {
  this.message=msg;
  this.name="Invalid BinaryFile";
}

// pretty print
InvalidBinaryFile.prototype.toString = function() {
  return this.name + ': "' + this.message + '"';
}

// =====================================================================
// BinaryFile class
//   Allows access to element inside a binary stream
function BinaryFile(strData, iDataOffset, iDataLength) {
	var data = strData;
	var dataOffset = iDataOffset || 0;
	var dataLength = 0;
	// added 
	var doubleMantExpHi=Math.pow(2,-28);
	var doubleMantExpLo=Math.pow(2,-52);
	var doubleMantExpFast=Math.pow(2,-20);

	var switch_endian = false;

	this.getRawData = function() {
		return data;
	}

	if (typeof strData == "string") {
		dataLength = iDataLength || data.length;

		this.getByteAt = function(iOffset) {
			return data.charCodeAt(iOffset + dataOffset) & 0xFF;
		}
	} else if (typeof strData == "unknown") {
		dataLength = iDataLength || IEBinary_getLength(data);

		this.getByteAt = function(iOffset) {
			return IEBinary_getByteAt(data, iOffset + dataOffset);
		}
	} else {
	  throw new InvalidBinaryFile("Unsupported type " + (typeof strData));
	}

	this.getEndianByteAt = function(iOffset,width,delta) {
	  if (this.switch_endian) 
	    return this.getByteAt(iOffset+width-delta-1);
	  else
	    return this.getByteAt(iOffset+delta);
	}

	this.getLength = function() {
		return dataLength;
	}

	this.getSByteAt = function(iOffset) {
		var iByte = this.getByteAt(iOffset);
		if (iByte > 127)
			return iByte - 256;
		else
			return iByte;
	}

	this.getShortAt = function(iOffset) {
	        var iShort = (this.getEndianByteAt(iOffset,2,1) << 8) + this.getEndianByteAt(iOffset,2,0)
		if (iShort < 0) iShort += 65536;
		return iShort;
	}
	this.getSShortAt = function(iOffset) {
		var iUShort = this.getShortAt(iOffset);
		if (iUShort > 32767)
			return iUShort - 65536;
		else
			return iUShort;
	}
	this.getLongAt = function(iOffset) {
	        var iByte1 = this.getEndianByteAt(iOffset,4,0),
	             iByte2 = this.getEndianByteAt(iOffset,4,1),
	             iByte3 = this.getEndianByteAt(iOffset,4,2),
	             iByte4 = this.getEndianByteAt(iOffset,4,3);

		var iLong = (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	}
	this.getSLongAt = function(iOffset) {
		var iULong = this.getLongAt(iOffset);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	}
	this.getStringAt = function(iOffset, iLength) {
		var aStr = [];
		for (var i=iOffset,j=0;i<iOffset+iLength;i++,j++) {
			aStr[j] = String.fromCharCode(this.getByteAt(i));
		}
		return aStr.join("");
	}

	// Added
	this.getCStringAt = function(iOffset, iMaxLength) {
		var aStr = [];
		for (var i=iOffset,j=0;(i<iOffset+iMaxLength) && (this.getByteAt(i)>0);i++,j++) {
			aStr[j] = String.fromCharCode(this.getByteAt(i));
		}
		return aStr.join("");
	}

	// Added
	this.getDoubleAt = function(iOffset) {
	        var iByte1 = this.getEndianByteAt(iOffset,8,0),
	             iByte2 = this.getEndianByteAt(iOffset,8,1),
	             iByte3 = this.getEndianByteAt(iOffset,8,2),
	             iByte4 = this.getEndianByteAt(iOffset,8,3),
	             iByte5 = this.getEndianByteAt(iOffset,8,4),
	             iByte6 = this.getEndianByteAt(iOffset,8,5),
	             iByte7 = this.getEndianByteAt(iOffset,8,6),
	             iByte8 = this.getEndianByteAt(iOffset,8,7);
		var iSign=iByte8 >> 7;
		var iExpRaw=((iByte8 & 0x7F)<< 4) + (iByte7 >> 4);
		var iMantHi=((((((iByte7 & 0x0F) << 8) + iByte6) << 8) + iByte5) << 8) + iByte4;
		var iMantLo=((((iByte3) << 8) + iByte2) << 8) + iByte1;

		if (iExpRaw==0) return 0.0;
		if (iExpRaw==0x7ff) return undefined;

		var iExp=(iExpRaw & 0x7FF)-1023;

		var dDouble = ((iSign==1)?-1:1)*Math.pow(2,iExp)*(1.0 + iMantLo*doubleMantExpLo + iMantHi*doubleMantExpHi);
		return dDouble;
	}
	// added
	// Extracts only 4 bytes out of 8, loosing in precision (20 bit mantissa)
	this.getFastDoubleAt = function(iOffset) {
	        var iByte5 = this.getEndianByteAt(iOffset,8,4),
		     iByte6 = this.getEndianByteAt(iOffset,8,5),
		     iByte7 = this.getEndianByteAt(iOffset,8,6),
		     iByte8 = this.getEndianByteAt(iOffset,8,7);
		var iSign=iByte8 >> 7;
		var iExpRaw=((iByte8 & 0x7F)<< 4) + (iByte7 >> 4);
		var iMant=((((iByte7 & 0x0F) << 8) + iByte6) << 8) + iByte5;

		if (iExpRaw==0) return 0.0;
		if (iExpRaw==0x7ff) return undefined;

		var iExp=(iExpRaw & 0x7FF)-1023;

		var dDouble = ((iSign==1)?-1:1)*Math.pow(2,iExp)*(1.0 + iMant*doubleMantExpFast);
		return dDouble;
	}

	this.getCharAt = function(iOffset) {
		return String.fromCharCode(this.getByteAt(iOffset));
	}
}


document.write(
	"<script type='text/vbscript'>\r\n"
	+ "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
	+ "	IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n"
	+ "End Function\r\n"
	+ "Function IEBinary_getLength(strBinary)\r\n"
	+ "	IEBinary_getLength = LenB(strBinary)\r\n"
	+ "End Function\r\n"
	+ "</script>\r\n"
);



// ===============================================================
// Load a binary file from the specified URL 
// Will return an object of type BinaryFile
function FetchBinaryURL(url) {
  var request =  new XMLHttpRequest();
  request.open("GET", url,false);
  try {
    request.overrideMimeType('text/plain; charset=x-user-defined');
  } catch (err) {
    // ignore any error, just to make both FF and IE work
  }
  request.send(null);

  var response=this.responseText;
  try {
    // for older IE versions, the value in responseText is not usable
    if (IEBinary_getLength(this.responseBody)>0) {
      // will get here only for older verson of IE
      response=this.responseBody;
    }
  } catch (err) {
    // not IE, do nothing
  }

  var bf=new BinaryFile(response);
  return bf;
}


// ===============================================================
// Asyncronously load a binary file from the specified URL 
//
// callback must be a function with one or two arguments:
//  - bf = an object of type BinaryFile
//  - optional argument object (used only if callback_arg not undefined) 
function FetchBinaryURLAsync(url, callback, callback_arg) {
  var callback_wrapper = function() {
    if(this.readyState == 4) {
      var response=this.responseText;
      try {
        // for older IE versions, the value in responseText is not usable
        if (IEBinary_getLength(this.responseBody)>0) {
          // will get here only for older verson of IE
          response=this.responseBody;
        }
      } catch (err) {
       // not IE, do nothing
      }

      var bf=new BinaryFile(response);
      if (callback_arg!=null) {
	callback(bf,callback_arg);
      } else {
	callback(bf);
      }
    }
  }

  var request =  new XMLHttpRequest();
  request.onreadystatechange = callback_wrapper;
  request.open("GET", url,true);
  try {
    request.overrideMimeType('text/plain; charset=x-user-defined');
  } catch (err) {
    // ignore any error, just to make both FF and IE work
  }
  request.send(null);
  return request
}
/*
 * Client library for access to RRD archive files
 * Part of the javascriptRRD package
 * Copyright (c) 2009-2010 Frank Wuerthwein, fkw@ucsd.edu
 *                         Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 *
 * RRDTool has been developed and is maintained by
 * Tobias Oether [http://oss.oetiker.ch/rrdtool/]
 *
 * This software can be used to read files produced by the RRDTool
 * but has been developed independently.
 * 
 * Limitations:
 *
 * This version of the module assumes RRD files created on linux 
 * with intel architecture and supports both 32 and 64 bit CPUs.
 * All integers in RRD files are suppoes to fit in 32bit values.
 *
 * Only versions 3 and 4 of the RRD archive are supported.
 *
 * Only AVERAGE,MAXIMUM,MINIMUM and LAST consolidation functions are
 * supported. For all others, the behaviour is at the moment undefined.
 *
 */

/*
 * Dependencies:
 *   
 * The data provided to this module require an object of a class
 * that implements the following methods:
 *   getByteAt(idx)            - Return a 8 bit unsigned integer at offset idx
 *   getLongAt(idx)            - Return a 32 bit unsigned integer at offset idx
 *   getDoubleAt(idx)          - Return a double float at offset idx
 *   getFastDoubleAt(idx)      - Similar to getDoubleAt but with less precision
 *   getCStringAt(idx,maxsize) - Return a string of at most maxsize characters
 *                               that was 0-terminated in the source
 *
 * The BinaryFile from binaryXHR.js implements this interface.
 *
 */


// ============================================================
// Exception class
function InvalidRRD(msg) {
  this.message=msg;
  this.name="Invalid RRD";
}

// pretty print
InvalidRRD.prototype.toString = function() {
  return this.name + ': "' + this.message + '"';
}


// ============================================================
// RRD DS Info class
function RRDDS(rrd_data,rrd_data_idx,my_idx) {
  this.rrd_data=rrd_data;
  this.rrd_data_idx=rrd_data_idx;
  this.my_idx=my_idx;
}

RRDDS.prototype.getIdx = function() {
  return this.my_idx;
}
RRDDS.prototype.getName = function() {
  return this.rrd_data.getCStringAt(this.rrd_data_idx,20);
}
RRDDS.prototype.getType = function() {
  return this.rrd_data.getCStringAt(this.rrd_data_idx+20,20);
}
RRDDS.prototype.getMin = function() {
  return this.rrd_data.getDoubleAt(this.rrd_data_idx+48);
}
RRDDS.prototype.getMax = function() {
  return this.rrd_data.getDoubleAt(this.rrd_data_idx+56);
}


// ============================================================
// RRD RRA Info class
function RRDRRAInfo(rrd_data,rra_def_idx,
		    int_align,row_cnt,pdp_step,my_idx) {
  this.rrd_data=rrd_data;
  this.rra_def_idx=rra_def_idx;
  this.int_align=int_align;
  this.row_cnt=row_cnt;
  this.pdp_step=pdp_step;
  this.my_idx=my_idx;

  // char nam[20], uint row_cnt, uint pdp_cnt
  this.rra_pdp_cnt_idx=rra_def_idx+Math.ceil(20/int_align)*int_align+int_align;
}

RRDRRAInfo.prototype.getIdx = function() {
  return this.my_idx;
}

// Get number of rows
RRDRRAInfo.prototype.getNrRows = function() {
  return this.row_cnt;
}

// Get number of slots used for consolidation
// Mostly for internal use
RRDRRAInfo.prototype.getPdpPerRow = function() {
  return this.rrd_data.getLongAt(this.rra_pdp_cnt_idx);
}

// Get RRA step (expressed in seconds)
RRDRRAInfo.prototype.getStep = function() {
  return this.pdp_step*this.getPdpPerRow();
}

// Get consolidation function name
RRDRRAInfo.prototype.getCFName = function() {
  return this.rrd_data.getCStringAt(this.rra_def_idx,20);
}


// ============================================================
// RRD RRA handling class
function RRDRRA(rrd_data,rra_ptr_idx,
		rra_info,
		header_size,prev_row_cnts,ds_cnt) {
  this.rrd_data=rrd_data;
  this.rra_info=rra_info;
  this.row_cnt=rra_info.row_cnt;
  this.ds_cnt=ds_cnt;

  var row_size=ds_cnt*8;

  this.base_rrd_db_idx=header_size+prev_row_cnts*row_size;

  // get imediately, since it will be needed often
  this.cur_row=rrd_data.getLongAt(rra_ptr_idx);

  // calculate idx relative to base_rrd_db_idx
  // mostly used internally
  this.calc_idx = function(row_idx,ds_idx) {
    if ((row_idx>=0) && (row_idx<this.row_cnt)) {
      if ((ds_idx>=0) && (ds_idx<ds_cnt)){
	// it is round robin, starting from cur_row+1
	var real_row_idx=row_idx+this.cur_row+1;
	if (real_row_idx>=this.row_cnt) real_row_idx-=this.row_cnt;
	return row_size*real_row_idx+ds_idx*8;
      } else {
	throw RangeError("DS idx ("+ row_idx +") out of range [0-" + ds_cnt +").");
      }
    } else {
      throw RangeError("Row idx ("+ row_idx +") out of range [0-" + this.row_cnt +").");
    }	
  }
}

RRDRRA.prototype.getIdx = function() {
  return this.rra_info.getIdx();
}

// Get number of rows/columns
RRDRRA.prototype.getNrRows = function() {
  return this.row_cnt;
}
RRDRRA.prototype.getNrDSs = function() {
  return this.ds_cnt;
}

// Get RRA step (expressed in seconds)
RRDRRA.prototype.getStep = function() {
  return this.rra_info.getStep();
}

// Get consolidation function name
RRDRRA.prototype.getCFName = function() {
  return this.rra_info.getCFName();
}

RRDRRA.prototype.getEl = function(row_idx,ds_idx) {
  return this.rrd_data.getDoubleAt(this.base_rrd_db_idx+this.calc_idx(row_idx,ds_idx));
}

// Low precision version of getEl
// Uses getFastDoubleAt
RRDRRA.prototype.getElFast = function(row_idx,ds_idx) {
  return this.rrd_data.getFastDoubleAt(this.base_rrd_db_idx+this.calc_idx(row_idx,ds_idx));
}

// ============================================================
// RRD Header handling class
function RRDHeader(rrd_data) {
  this.rrd_data=rrd_data;
  this.validate_rrd();
  this.calc_idxs();
}

// Internal, used for initialization
RRDHeader.prototype.validate_rrd = function() {
  if (this.rrd_data.getLength()<1) throw new InvalidRRD("Empty file.");
  if (this.rrd_data.getLength()<16) throw new InvalidRRD("File too short.");
  if (this.rrd_data.getCStringAt(0,4)!=="RRD") throw new InvalidRRD("Wrong magic id.");

  this.rrd_version=this.rrd_data.getCStringAt(4,5);
  if ((this.rrd_version!=="0003")&&(this.rrd_version!=="0004")&&(this.rrd_version!=="0001")) {
    throw new InvalidRRD("Unsupported RRD version "+this.rrd_version+".");
  }

  this.float_width=8;
  if (this.rrd_data.getLongAt(12)==0) {
    // not a double here... likely 64 bit
    this.float_align=8;
    if (! (this.rrd_data.getDoubleAt(16)==8.642135e+130)) {
      // uhm... wrong endian?
      this.rrd_data.switch_endian=true;
    }
    if (this.rrd_data.getDoubleAt(16)==8.642135e+130) {
      // now, is it all 64bit or only float 64 bit?
      if (this.rrd_data.getLongAt(28)==0) {
	// true 64 bit align
	this.int_align=8;
	this.int_width=8;
      } else {
	// integers are 32bit aligned
	this.int_align=4;
	this.int_width=4;
      }
    } else {
      throw new InvalidRRD("Magic float not found at 16.");
    }
  } else {
    /// should be 32 bit alignment
    if (! (this.rrd_data.getDoubleAt(12)==8.642135e+130)) {
      // uhm... wrong endian?
      this.rrd_data.switch_endian=true;
    }
    if (this.rrd_data.getDoubleAt(12)==8.642135e+130) {
      this.float_align=4;
      this.int_align=4;
      this.int_width=4;
    } else {
      throw new InvalidRRD("Magic float not found at 12.");
    }
  }
  this.unival_width=this.float_width;
  this.unival_align=this.float_align;

  // process the header here, since I need it for validation

  // char magic[4], char version[5], double magic_float

  // long ds_cnt, long rra_cnt, long pdp_step, unival par[10]
  this.ds_cnt_idx=Math.ceil((4+5)/this.float_align)*this.float_align+this.float_width;
  this.rra_cnt_idx=this.ds_cnt_idx+this.int_width;
  this.pdp_step_idx=this.rra_cnt_idx+this.int_width;

  //always get only the low 32 bits, the high 32 on 64 bit archs should always be 0
  this.ds_cnt=this.rrd_data.getLongAt(this.ds_cnt_idx);
  if (this.ds_cnt<1) {
    throw new InvalidRRD("ds count less than 1.");
  }

  this.rra_cnt=this.rrd_data.getLongAt(this.rra_cnt_idx);
  if (this.ds_cnt<1) {
    throw new InvalidRRD("rra count less than 1.");
  }

  this.pdp_step=this.rrd_data.getLongAt(this.pdp_step_idx);
  if (this.pdp_step<1) {
    throw new InvalidRRD("pdp step less than 1.");
  }

  // best guess, assuming no weird align problems
  this.top_header_size=Math.ceil((this.pdp_step_idx+this.int_width)/this.unival_align)*this.unival_align+10*this.unival_width;
  var t=this.rrd_data.getLongAt(this.top_header_size);
  if (t==0) {
    throw new InvalidRRD("Could not find first DS name.");
  }
}

// Internal, used for initialization
RRDHeader.prototype.calc_idxs = function() {
  this.ds_def_idx=this.top_header_size;
  // char ds_nam[20], char dst[20], unival par[10]
  this.ds_el_size=Math.ceil((20+20)/this.unival_align)*this.unival_align+10*this.unival_width;

  this.rra_def_idx=this.ds_def_idx+this.ds_el_size*this.ds_cnt;
  // char cf_nam[20], uint row_cnt, uint pdp_cnt, unival par[10]
  this.row_cnt_idx=Math.ceil(20/this.int_align)*this.int_align;
  this.rra_def_el_size=Math.ceil((this.row_cnt_idx+2*this.int_width)/this.unival_align)*this.unival_align+10*this.unival_width;

  this.live_head_idx=this.rra_def_idx+this.rra_def_el_size*this.rra_cnt;
  // time_t last_up, int last_up_usec
  this.live_head_size=2*this.int_width;

  this.pdp_prep_idx=this.live_head_idx+this.live_head_size;
  // char last_ds[30], unival scratch[10]
  this.pdp_prep_el_size=Math.ceil(30/this.unival_align)*this.unival_align+10*this.unival_width;

  this.cdp_prep_idx=this.pdp_prep_idx+this.pdp_prep_el_size*this.ds_cnt;
  // unival scratch[10]
  this.cdp_prep_el_size=10*this.unival_width;

  this.rra_ptr_idx=this.cdp_prep_idx+this.cdp_prep_el_size*this.ds_cnt*this.rra_cnt;
  // uint cur_row
  this.rra_ptr_el_size=1*this.int_width;
  
  this.header_size=this.rra_ptr_idx+this.rra_ptr_el_size*this.rra_cnt;
}

// Optional initialization
// Read and calculate row counts
RRDHeader.prototype.load_row_cnts = function() {
  this.rra_def_row_cnts=[];
  this.rra_def_row_cnt_sums=[]; // how many rows before me
  for (var i=0; i<this.rra_cnt; i++) {
    this.rra_def_row_cnts[i]=this.rrd_data.getLongAt(this.rra_def_idx+i*this.rra_def_el_size+this.row_cnt_idx,false);
    if (i==0) {
      this.rra_def_row_cnt_sums[i]=0;
    } else {
      this.rra_def_row_cnt_sums[i]=this.rra_def_row_cnt_sums[i-1]+this.rra_def_row_cnts[i-1];
    }
  }
}

// ---------------------------
// Start of user functions

RRDHeader.prototype.getMinStep = function() {
  return this.pdp_step;
}
RRDHeader.prototype.getLastUpdate = function() {
  return this.rrd_data.getLongAt(this.live_head_idx,false);
}

RRDHeader.prototype.getNrDSs = function() {
  return this.ds_cnt;
}
RRDHeader.prototype.getDSNames = function() {
  var ds_names=[]
  for (var idx=0; idx<this.ds_cnt; idx++) {
    var ds=this.getDSbyIdx(idx);
    var ds_name=ds.getName()
    ds_names.push(ds_name);
  }
  return ds_names;
}
RRDHeader.prototype.getDSbyIdx = function(idx) {
  if ((idx>=0) && (idx<this.ds_cnt)) {
    return new RRDDS(this.rrd_data,this.ds_def_idx+this.ds_el_size*idx,idx);
  } else {
    throw RangeError("DS idx ("+ idx +") out of range [0-" + this.ds_cnt +").");
  }	
}
RRDHeader.prototype.getDSbyName = function(name) {
  for (var idx=0; idx<this.ds_cnt; idx++) {
    var ds=this.getDSbyIdx(idx);
    var ds_name=ds.getName()
    if (ds_name==name)
      return ds;
  }
  throw RangeError("DS name "+ name +" unknown.");
}

RRDHeader.prototype.getNrRRAs = function() {
  return this.rra_cnt;
}
RRDHeader.prototype.getRRAInfo = function(idx) {
  if ((idx>=0) && (idx<this.rra_cnt)) {
    return new RRDRRAInfo(this.rrd_data,
			  this.rra_def_idx+idx*this.rra_def_el_size,
			  this.int_align,this.rra_def_row_cnts[idx],this.pdp_step,
			  idx);
  } else {
    throw RangeError("RRA idx ("+ idx +") out of range [0-" + this.rra_cnt +").");
  }	
}

// ============================================================
// RRDFile class
//   Given a BinaryFile, gives access to the RRD archive fields
// 
// Arguments:
//   bf must be an object compatible with the BinaryFile interface
//   file_options - currently no semantics... introduced for future expandability
function RRDFile(bf,file_options) {
  this.file_options=file_options;

  var rrd_data=bf

  this.rrd_header=new RRDHeader(rrd_data);
  this.rrd_header.load_row_cnts();

  // ===================================
  // Start of user functions

  this.getMinStep = function() {
    return this.rrd_header.getMinStep();
  }
  this.getLastUpdate = function() {
    return this.rrd_header.getLastUpdate();
  }

  this.getNrDSs = function() {
    return this.rrd_header.getNrDSs();
  }
  this.getDSNames = function() {
    return this.rrd_header.getDSNames();
  }
  this.getDS = function(id) {
    if (typeof id == "number") {
      return this.rrd_header.getDSbyIdx(id);
    } else {
      return this.rrd_header.getDSbyName(id);
    }
  }

  this.getNrRRAs = function() {
    return this.rrd_header.getNrRRAs();
  }

  this.getRRAInfo = function(idx) {
    return this.rrd_header.getRRAInfo(idx);
  }

  this.getRRA = function(idx) {
    rra_info=this.rrd_header.getRRAInfo(idx);
    return new RRDRRA(rrd_data,
		      this.rrd_header.rra_ptr_idx+idx*this.rrd_header.rra_ptr_el_size,
		      rra_info,
		      this.rrd_header.header_size,
		      this.rrd_header.rra_def_row_cnt_sums[idx],
		      this.rrd_header.ds_cnt);
  }

}
/*
 * Support library aimed at providing commonly used functions and classes
 * that may be used while plotting RRD files with Flot
 *
 * Part of the javascriptRRD package
 * Copyright (c) 2009 Frank Wuerthwein, fkw@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 *
 * Flot is a javascript plotting library developed and maintained by
 * Ole Laursen [http://www.flotcharts.org/]
 *
 */

// Return a Flot-like data structure
// Since Flot does not properly handle empty elements, min and max are returned, too
function rrdDS2FlotSeries(rrd_file,ds_id,rra_idx,want_rounding) {
  var ds=rrd_file.getDS(ds_id);
  var ds_name=ds.getName();
  var ds_idx=ds.getIdx();
  var rra=rrd_file.getRRA(rra_idx);
  var rra_rows=rra.getNrRows();
  var last_update=rrd_file.getLastUpdate();
  var step=rra.getStep();

  if (want_rounding!=false) {
    // round last_update to step
    // so that all elements are sync
    last_update-=(last_update%step); 
  }

  var first_el=last_update-(rra_rows-1)*step;
  var timestamp=first_el;
  var flot_series=[];
  for (var i=0;i<rra_rows;i++) {
    var el=rra.getEl(i,ds_idx);
    if (el!=undefined) {
      flot_series.push([timestamp*1000.0,el]);
    }
    timestamp+=step;
  } // end for

  return {label: ds_name, data: flot_series, min: first_el*1000.0, max:last_update*1000.0};
}

// return an object with an array containing Flot elements, one per DS
// min and max are also returned
function rrdRRA2FlotObj(rrd_file,rra_idx,ds_list,want_ds_labels,want_rounding) {
  var rra=rrd_file.getRRA(rra_idx);
  var rra_rows=rra.getNrRows();
  var last_update=rrd_file.getLastUpdate();
  var step=rra.getStep();
  if (want_rounding!=false) {
    // round last_update to step
    // so that all elements are sync
    last_update-=(last_update%step); 
  }

  var first_el=last_update-(rra_rows-1)*step;

  var out_el={data:[], min:first_el*1000.0, max:last_update*1000.0};

  var ds_list_len = ds_list.length;
  for (var ds_list_idx=0; ds_list_idx<ds_list_len; ++ds_list_idx) { 
    var ds_id=ds_list[ds_list_idx];
    var ds=rrd_file.getDS(ds_id);
    var ds_name=ds.getName();
    var ds_idx=ds.getIdx();

    var timestamp=first_el;
    var flot_series=[];
    for (var i=0;i<rra_rows;i++) {
      var el=rra.getEl(i,ds_idx);
      if (el!=undefined) {
	flot_series.push([timestamp*1000.0,el]);
      }
      timestamp+=step;
    } // end for
    
    var flot_el={data:flot_series};
    if (want_ds_labels!=false) {
      var ds_name=ds.getName();
      flot_el.label= ds_name;
    }
    out_el.data.push(flot_el);
  } //end for ds_list_idx
  return out_el;
}

// return an object with an array containing Flot elements
//  have a positive and a negative stack of DSes, plus DSes with no stacking
// min and max are also returned
// If one_undefined_enough==true, a whole stack is invalidated if a single element
//  of the stack is invalid
function rrdRRAStackFlotObj(rrd_file,rra_idx,
			    ds_positive_stack_list,ds_negative_stack_list,ds_single_list,
                            timestamp_shift, want_ds_labels,want_rounding,one_undefined_enough) {
  var rra=rrd_file.getRRA(rra_idx);
  var rra_rows=rra.getNrRows();
  var last_update=rrd_file.getLastUpdate();
  var step=rra.getStep();
  if (want_rounding!=false) {
    // round last_update to step
    // so that all elements are sync
    last_update-=(last_update%step); 
  }
  if (one_undefined_enough!=true) { // make sure it is a boolean
    one_undefined_enough=false;
  }

  var first_el=last_update-(rra_rows-1)*step;

  var out_el={data:[], min:(first_el+timestamp_shift)*1000.0, max:(last_update+timestamp_shift)*1000.0};

  // first the stacks stack
  var stack_els=[ds_positive_stack_list,ds_negative_stack_list];
  var stack_els_len = stack_els.length;
  for (var stack_list_id=0; stack_list_id<stack_els_len; ++stack_list_id) {
    var stack_list=stack_els[stack_list_id];
    var tmp_flot_els=[];
    var tmp_ds_ids=[];
    var tmp_nr_ids=stack_list.length;
    var stack_list_len = stack_list.length;
    for (var ds_list_idx=0; ds_list_idx<stack_list_len; ++ds_list_idx) {
      var ds_id=stack_list[ds_list_idx];
      var ds=rrd_file.getDS(ds_id);
      var ds_name=ds.getName();
      var ds_idx=ds.getIdx();
      tmp_ds_ids.push(ds_idx); // getting this is expensive, call only once
      
      // initialize
      var flot_el={data:[]}
      if (want_ds_labels!=false) {
	var ds_name=ds.getName();
	flot_el.label= ds_name;
      }
      tmp_flot_els.push(flot_el);
    }

    var timestamp=first_el;
    for (var row=0;row<rra_rows;row++) {
      var ds_vals=[];
      var all_undef=true;
      var all_def=true;
      for (var id=0; id<tmp_nr_ids; id++) {
	var ds_idx=tmp_ds_ids[id];
	var el=rra.getEl(row,ds_idx);
	if (el!=undefined) {
	  all_undef=false;
	  ds_vals.push(el);
	} else {
	  all_def=false;
	  ds_vals.push(0);
	}
      } // end for id
      if (!all_undef) { // if all undefined, skip
	if (all_def || (!one_undefined_enough)) {
	  // this is a valid column, do the math
	  for (var id=1; id<tmp_nr_ids; id++) {
	    ds_vals[id]+=ds_vals[id-1]; // both positive and negative stack use a +, negative stack assumes negative values
	  }
	  // fill the flot data
	  for (var id=0; id<tmp_nr_ids; id++) {
	    tmp_flot_els[id].data.push([(timestamp+timestamp_shift)*1000.0,ds_vals[id]]);
	  }
	}
      } // end if

      timestamp+=step;
    } // end for row
    
    // put flot data in output object
    // reverse order so higher numbers are behind
    for (var id=0; id<tmp_nr_ids; id++) {
      out_el.data.push(tmp_flot_els[tmp_nr_ids-id-1]);
    }
  } //end for stack_list_id

  var ds_single_list_len = ds_single_list.length;
  for (var ds_list_idx=0; ds_list_idx<ds_single_list_len; ++ds_list_idx) { 
    var ds_id=ds_single_list[ds_list_idx];
    var ds=rrd_file.getDS(ds_id);
    var ds_name=ds.getName();
    var ds_idx=ds.getIdx();

    var timestamp=first_el;
    var flot_series=[];
    for (var i=0;i<rra_rows;i++) {
      var el=rra.getEl(i,ds_idx);
      if (el!=undefined) {
	flot_series.push([(timestamp+timestamp_shift)*1000.0,el]);
      }
      timestamp+=step;
    } // end for
    
    var flot_el={data:flot_series};
    if (want_ds_labels!=false) {
      var ds_name=ds.getName();
      flot_el.label= ds_name;
    }
    out_el.data.push(flot_el);
  } //end for ds_list_idx

  return out_el;
}

// return an object with an array containing Flot elements, one per RRD
// min and max are also returned
function rrdRRAMultiStackFlotObj(rrd_files, // a list of [rrd_id,rrd_file] pairs, all rrds must have the same step
				 rra_idx,ds_id,
				 want_rrd_labels,want_rounding,
				 one_undefined_enough) { // If true, a whole stack is invalidated if a single element of the stack is invalid

  var reference_rra=rrd_files[0][1].getRRA(rra_idx); // get the first one, all should be the same
  var rows=reference_rra.getNrRows();
  var step=reference_rra.getStep();
  var ds_idx=rrd_files[0][1].getDS(ds_id).getIdx(); // this can be expensive, do once (all the same)

  // rrds can be slightly shifted, calculate range
  var max_ts=null;
  var min_ts=null;

  // initialize list of rrd data elements
  var tmp_flot_els=[];
  var tmp_rras=[];
  var tmp_last_updates=[];
  var tmp_nr_ids=rrd_files.length;
  for (var id=0; id<tmp_nr_ids; id++) {
    var rrd_file=rrd_files[id][1];
    var rrd_rra=rrd_file.getRRA(rra_idx);

    var rrd_last_update=rrd_file.getLastUpdate();
    if (want_rounding!=false) {
      // round last_update to step
      // so that all elements are sync
      rrd_last_update-=(rrd_last_update%step); 
    }
    tmp_last_updates.push(rrd_last_update);

    var rrd_min_ts=rrd_last_update-(rows-1)*step;
    if ((max_ts==null) || (rrd_last_update>max_ts)) {
      max_ts=rrd_last_update;
    }
    if ((min_ts==null) || (rrd_min_ts<min_ts)) {
      min_ts=rrd_min_ts;
    }
    
    tmp_rras.push(rrd_rra);
      
    // initialize
    var flot_el={data:[]}
    if (want_rrd_labels!=false) {
	var rrd_name=rrd_files[id][0];
	flot_el.label= rrd_name;
    }
    tmp_flot_els.push(flot_el);
  }

  var out_el={data:[], min:min_ts*1000.0, max:max_ts*1000.0};

  for (var ts=min_ts;ts<=max_ts;ts+=step) {
      var rrd_vals=[];
      var all_undef=true;
      var all_def=true;
      for (var id=0; id<tmp_nr_ids; id++) {
        var rrd_rra=tmp_rras[id];
        var rrd_last_update=tmp_last_updates[id];
	var row_delta=Math.round((rrd_last_update-ts)/step);
	var el=undefined; // if out of range
        if ((row_delta>=0) && (row_delta<rows)) {
          el=rrd_rra.getEl(rows-row_delta-1,ds_idx);
        }
	if (el!=undefined) {
	  all_undef=false;
	  rrd_vals.push(el);
	} else {
	  all_def=false;
	  rrd_vals.push(0);
	}
      } // end for id
      if (!all_undef) { // if all undefined, skip
	if (all_def || (!one_undefined_enough)) {
	  // this is a valid column, do the math
	  for (var id=1; id<tmp_nr_ids; id++) {
	    rrd_vals[id]+=rrd_vals[id-1]; 
	  }
	  // fill the flot data
	  for (var id=0; id<tmp_nr_ids; id++) {
	    tmp_flot_els[id].data.push([ts*1000.0,rrd_vals[id]]);
	  }
	}
      } // end if
  } // end for ts
    
  // put flot data in output object
  // reverse order so higher numbers are behind
  for (var id=0; id<tmp_nr_ids; id++) {
    out_el.data.push(tmp_flot_els[tmp_nr_ids-id-1]);
  }
  
  return out_el;
}

// ======================================
// Helper class for handling selections
// =======================================================
function rrdFlotSelection() {
  this.selection_min=null;
  this.selection_max=null;
};

// reset to a state where ther is no selection
rrdFlotSelection.prototype.reset = function() {
  this.selection_min=null;
  this.selection_max=null;
};

// given the selection ranges, set internal variable accordingly
rrdFlotSelection.prototype.setFromFlotRanges = function(ranges) {
  this.selection_min=ranges.xaxis.from;
  this.selection_max=ranges.xaxis.to;
};

// Return a Flot ranges structure that can be promptly used in setSelection
rrdFlotSelection.prototype.getFlotRanges = function() {
  return { xaxis: {from: this.selection_min, to: this.selection_max}};
};

// return true is a selection is in use
rrdFlotSelection.prototype.isSet = function() {
  return this.selection_min!=null;
};

// Given an array of flot lines, limit to the selection
rrdFlotSelection.prototype.trim_flot_data = function(flot_data) {
  var out_data=[];
  for (var i=0; i<flot_data.length; i++) {
    var data_el=flot_data[i];
    out_data.push({label : data_el.label, data:this.trim_data(data_el.data), color:data_el.color, lines:data_el.lines, yaxis:data_el.yaxis});
  }
  return out_data;
};

// Limit to selection the flot series data element
rrdFlotSelection.prototype.trim_data = function(data_list) {
  if (this.selection_min==null) return data_list; // no selection => no filtering

  var out_data=[];
  for (var i=0; i<data_list.length; i++) {
    
    if (data_list[i]==null) continue; // protect
    //data_list[i][0]+=3550000*5;
    var nr=data_list[i][0]; //date in unix time
    if ((nr>=this.selection_min) && (nr<=this.selection_max)) {
      out_data.push(data_list[i]);
    }
  }
  return out_data;
};


// Given an array of flot lines, limit to the selection
rrdFlotSelection.prototype.trim_flot_timezone_data = function(flot_data,shift) {
  var out_data=[];
  for (var i=0; i<flot_data.length; i++) {
    var data_el=flot_data[i];
    out_data.push({label : data_el.label, data:this.trim_timezone_data(data_el.data,shift), color:data_el.color, lines:data_el.lines, yaxis:data_el.yaxis});
  }
  return out_data;
};

// Limit to selection the flot series data element
rrdFlotSelection.prototype.trim_timezone_data = function(data_list,shift) {
  if (this.selection_min==null) return data_list; // no selection => no filtering

  var out_data=[];
  for (var i=0; i<data_list.length; i++) {
    if (data_list[i]==null) continue; // protect
    var nr=data_list[i][0]+shift;
    if ((nr>=this.selection_min) && (nr<=this.selection_max)) {
      out_data.push(data_list[i]);
    }
  }
  return out_data;
};


// ======================================
// Miscelaneous helper functions
// ======================================

function rfs_format_time(s) {
  if (s<120) {
    return s+"s";
  } else {
    var s60=s%60;
    var m=(s-s60)/60;
    if ((m<10) && (s60>9)) {
      return m+":"+s60+"min";
    } if (m<120) {
      return m+"min";
    } else {
      var m60=m%60;
      var h=(m-m60)/60;
      if ((h<12) && (m60>9)) {
	return h+":"+m60+"h";
      } if (h<48) {
	return h+"h";
      } else {
	var h24=h%24;
	var d=(h-h24)/24;
	if ((d<7) && (h24>0)) {
	  return d+" days "+h24+"h";
	} if (d<60) {
	  return d+" days";
	} else {
	  var d30=d%30;
	  var mt=(d-d30)/30;
	  return mt+" months";
	}
      }
    }
    
  }
}
/*
 * RRD graphing libraries, based on Flot
 * Part of the javascriptRRD package
 * Copyright (c) 2010 Frank Wuerthwein, fkw@ucsd.edu
 *                    Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 *
 * Flot is a javascript plotting library developed and maintained by
 * Ole Laursen [http://code.google.com/p/flot/]
 *
 */

/*
 * Local dependencies:
 *  rrdFlotSupport.py
 *
 * External dependencies:
 *  [Flot]/jquery.py
 *  [Flot]/jquery.flot.js
 *  [Flot]/jquery.flot.selection.js
 */

/* graph_options defaults (see Flot docs for details)
 * {
 *  legend: { position:"nw",noColumns:3},
 *  lines: { show:true },
 *  yaxis: { autoscaleMargin: 0.20},
 *  tooltip: true,
 *  tooltipOpts: { content: "<h4>%s</h4> Value: %y.3" }
 * }
 *
 * ds_graph_options is a dictionary of DS_name, 
 *   with each element being a graph_option
 *   The defaults for each element are
 *   {
 *     title: label  or ds_name     // this is what is displayed in the checkboxes
 *     checked: first_ds_in_list?   // boolean
 *     label: title or ds_name      // this is what is displayed in the legend
 *     color: ds_index              // see Flot docs for details
 *     lines: { show:true }         // see Flot docs for details
 *     yaxis: 1                     // can be 1 or 2
 *     stack: 'none'                // other options are 'positive' and 'negative'
 *   }
 *
 * //overwrites other defaults; mostly used for linking via the URL
 * rrdflot_defaults defaults (see Flot docs for details) 	 
 * {
 *    graph_only: false        // If true, limit the display to the graph only
 *    legend: "Top"            //Starting location of legend. Options are: 
 *                             //   "Top","Bottom","TopRight","BottomRight","None".
 *    num_cb_rows: 12          //How many rows of DS checkboxes per column.
 *    use_element_buttons: false  //To be used in conjunction with num_cb_rows: This option
 *                             //    creates a button above every column, which selects
 *                             //    every element in the column. 
 *    multi_ds: false          //"true" appends the name of the aggregation function to the 
 *                             //    name of the DS element. 
 *    multi_rra: false         //"true" appends the name of the RRA consolidation function (CF) 
 *                             //    (AVERAGE, MIN, MAX or LAST) to the name of the RRA. Useful 
 *                             //    for RRAs over the same interval with different CFs.  
 *    use_checked_DSs: false   //Use the list checked_DSs below.
 *    checked_DSs: []          //List of elements to be checked by default when graph is loaded. 
 *                             //    Overwrites graph options. 
 *    use_rra: false           //Whether to use the rra index specified below.
 *    rra: 0                   //RRA (rra index in rrd) to be selected when graph is loaded. 
 *    use_windows: false       //Whether to use the window zoom specifications below.
 *    window_min: 0            //Sets minimum for window zoom. X-axis usually in unix time. 
 *    window_max: 0            //Sets maximum for window zoom.
 *    graph_height: "300px"    //Height of main graph. 
 *    graph_width: "500px"     //Width of main graph.
 *    scale_height: "110px"    //Height of small scaler graph.
 *    scale_width: "250px"     //Width of small scaler graph.
 *    timezone: local          //timezone.
 * } 
 */

var local_checked_DSs = [];
var selected_rra = 0;
var window_min=0;
var window_max=0;
var elem_group=null;
var timezone_shift=0;

function rrdFlot(html_id, rrd_file, graph_options, ds_graph_options, rrdflot_defaults) {
  this.html_id=html_id;
  this.rrd_file=rrd_file;
  this.graph_options=graph_options;
  if (rrdflot_defaults==null) {
    this.rrdflot_defaults=new Object(); // empty object, just not to be null
  } else {
    this.rrdflot_defaults=rrdflot_defaults;
  }
  if (ds_graph_options==null) {
    this.ds_graph_options=new Object(); // empty object, just not to be null
  } else {
    this.ds_graph_options=ds_graph_options;
  }
  this.selection_range=new rrdFlotSelection();

  graph_info={};
  this.createHTML();
  this.populateRes();
  this.populateDScb();
  this.drawFlotGraph();

  if (this.rrdflot_defaults.graph_only==true) {
    this.cleanHTMLCruft();
  }
}


// ===============================================
// Create the HTML tags needed to host the graphs
rrdFlot.prototype.createHTML = function() {
  var rf_this=this; // use obj inside other functions

  var base_el=document.getElementById(this.html_id);

  this.res_id=this.html_id+"_res";
  this.ds_cb_id=this.html_id+"_ds_cb";
  this.graph_id=this.html_id+"_graph";
  this.scale_id=this.html_id+"_scale";
  this.legend_sel_id=this.html_id+"_legend_sel";
  this.time_sel_id=this.html_id+"_time_sel";
  this.elem_group_id=this.html_id+"_elem_group";

  // First clean up anything in the element
  while (base_el.lastChild!=null) base_el.removeChild(base_el.lastChild);

  // Now create the layout
  var external_table=document.createElement("Table");
  this.external_table=external_table;

  // Header two: resulution select and DS selection title
  var rowHeader=external_table.insertRow(-1);
  var cellRes=rowHeader.insertCell(-1);
  cellRes.colSpan=3;
  cellRes.appendChild(document.createTextNode("Resolution:"));
  var forRes=document.createElement("Select");
  forRes.id=this.res_id;
  //forRes.onChange= this.callback_res_changed;
  forRes.onchange= function () {rf_this.callback_res_changed();};
  cellRes.appendChild(forRes);
  
  var cellDSTitle=rowHeader.insertCell(-1);
  cellDSTitle.appendChild(document.createTextNode("Select elements to plot:"));

  // Graph row: main graph and DS selection block
  var rowGraph=external_table.insertRow(-1);
  var cellGraph=rowGraph.insertCell(-1);
  cellGraph.colSpan=3;
  var elGraph=document.createElement("Div");
  if(this.rrdflot_defaults.graph_width!=null) {
     elGraph.style.width=this.rrdflot_defaults.graph_width;
  } else {elGraph.style.width="500px";}
  if(this.rrdflot_defaults.graph_height!=null) {
     elGraph.style.height=this.rrdflot_defaults.graph_height;
  } else {elGraph.style.height="300px";}
  elGraph.id=this.graph_id;
  cellGraph.appendChild(elGraph);

  var cellDScb=rowGraph.insertCell(-1);
  

  cellDScb.vAlign="top";
  var formDScb=document.createElement("Form");
  formDScb.id=this.ds_cb_id;
  formDScb.onchange= function () {rf_this.callback_ds_cb_changed();};
  cellDScb.appendChild(formDScb);

  // Scale row: scaled down selection graph
  var rowScale=external_table.insertRow(-1);

  var cellScaleLegend=rowScale.insertCell(-1);
  cellScaleLegend.vAlign="top";
  cellScaleLegend.appendChild(document.createTextNode("Legend:"));
  cellScaleLegend.appendChild(document.createElement('br'));

  var forScaleLegend=document.createElement("Select");
  forScaleLegend.id=this.legend_sel_id;
  forScaleLegend.appendChild(new Option("Top","nw",this.rrdflot_defaults.legend=="Top",this.rrdflot_defaults.legend=="Top"));
  forScaleLegend.appendChild(new Option("Bottom","sw",this.rrdflot_defaults.legend=="Bottom",this.rrdflot_defaults.legend=="Bottom"));
  forScaleLegend.appendChild(new Option("TopRight","ne",this.rrdflot_defaults.legend=="TopRight",this.rrdflot_defaults.legend=="TopRight"));
  forScaleLegend.appendChild(new Option("BottomRight","se",this.rrdflot_defaults.legend=="BottomRight",this.rrdflot_defaults.legend=="BottomRight"));
  forScaleLegend.appendChild(new Option("None","None",this.rrdflot_defaults.legend=="None",this.rrdflot_defaults.legend=="None"));
  forScaleLegend.onchange= function () {rf_this.callback_legend_changed();};
  cellScaleLegend.appendChild(forScaleLegend);


  cellScaleLegend.appendChild(document.createElement('br'));
  cellScaleLegend.appendChild(document.createTextNode("Timezone:"));
  cellScaleLegend.appendChild(document.createElement('br'));

  var timezone=document.createElement("Select");
  timezone.id=this.time_sel_id;

  var timezones = ["+12","+11","+10","+9","+8","+7","+6","+5","+4","+3","+2","+1","0",
                  "-1","-2","-3","-4","-5","-6","-7","-8","-9","-10","-11","-12"];
  var tz_found=false;
  var true_tz;
  for(var j=0; j<24; j++) {
    if (Math.ceil(this.rrdflot_defaults.timezone)==Math.ceil(timezones[j])) {
      tz_found=true;
      true_tz=Math.ceil(this.rrdflot_defaults.timezone);
      break;
    }
  }
  if (!tz_found) {
    // the passed timezone does not make sense
    // find the local time
    var d= new Date();
    true_tz=-Math.ceil(d.getTimezoneOffset()/60);
  }
  for(var j=0; j<24; j++) {
    timezone.appendChild(new Option(timezones[j],timezones[j],true_tz==Math.ceil(timezones[j]),true_tz==Math.ceil(timezones[j])));
  }
  timezone.onchange= function () {rf_this.callback_timezone_changed();};

  cellScaleLegend.appendChild(timezone);

  var cellScale=rowScale.insertCell(-1);
  cellScale.align="right";
  var elScale=document.createElement("Div");
  if(this.rrdflot_defaults.scale_width!=null) {
     elScale.style.width=this.rrdflot_defaults.scale_width;
  } else {elScale.style.width="250px";}
  if(this.rrdflot_defaults.scale_height!=null) {
     elScale.style.height=this.rrdflot_defaults.scale_height;
  } else {elScale.style.height="110px";}
  elScale.id=this.scale_id;
  cellScale.appendChild(elScale);
  
  var cellScaleReset=rowScale.insertCell(-1);
  cellScaleReset.vAlign="top";
  cellScaleReset.appendChild(document.createTextNode(" "));
  cellScaleReset.appendChild(document.createElement('br'));
  var elScaleReset=document.createElement("input");
  elScaleReset.type = "button";
  elScaleReset.value = "Reset selection";
  elScaleReset.onclick = function () {rf_this.callback_scale_reset();}

  cellScaleReset.appendChild(elScaleReset);

  base_el.appendChild(external_table);
};

// ===============================================
// Remove all HTMl elements but the graph
rrdFlot.prototype.cleanHTMLCruft = function() {
  var rf_this=this; // use obj inside other functions

  // delete top and bottom rows... graph is in the middle
  this.external_table.deleteRow(-1);
  this.external_table.deleteRow(0);

  var ds_el=document.getElementById(this.ds_cb_id);
  ds_el.removeChild(ds_el.lastChild);
}

// ======================================
// Populate RRA and RD info
rrdFlot.prototype.populateRes = function() {
  var form_el=document.getElementById(this.res_id);

  // First clean up anything in the element
  while (form_el.lastChild!=null) form_el.removeChild(form_el.lastChild);

  // now populate with RRA info
  var nrRRAs=this.rrd_file.getNrRRAs();
  for (var i=0; i<nrRRAs; i++) {

    var rra=this.rrd_file.getRRAInfo(i);
    var step=rra.getStep();
    var rows=rra.getNrRows();
    var period=step*rows;
    var rra_label=rfs_format_time(step)+" ("+rfs_format_time(period)+" total)";
    if (this.rrdflot_defaults.multi_rra) rra_label+=" "+rra.getCFName();
    form_el.appendChild(new Option(rra_label,i));
  }
    if(this.rrdflot_defaults.use_rra) {form_el.selectedIndex = this.rrdflot_defaults.rra;}
};

rrdFlot.prototype.populateDScb = function() {
  var rf_this=this; // use obj inside other functions
  var form_el=document.getElementById(this.ds_cb_id);
 
  //Create a table within a table to arrange
  // checkbuttons into two or more columns
  var table_el=document.createElement("Table");
  var row_el=table_el.insertRow(-1);
  row_el.vAlign="top";
  var cell_el=null; // will define later

  if (this.rrdflot_defaults.num_cb_rows==null) {
     this.rrdflot_defaults.num_cb_rows=12; 
  }
  // now populate with DS info
  var nrDSs=this.rrd_file.getNrDSs();
  var elem_group_number = 0;
 
  for (var i=0; i<nrDSs; i++) {

    if ((i%this.rrdflot_defaults.num_cb_rows)==0) { // one column every x DSs
      if(this.rrdflot_defaults.use_element_buttons) {
        cell_el=row_el.insertCell(-1); //make next element column 
        if(nrDSs>this.rrdflot_defaults.num_cb_rows) { //if only one column, no need for a button
          elem_group_number = (i/this.rrdflot_defaults.num_cb_rows)+1;
          var elGroupSelect = document.createElement("input");
          elGroupSelect.type = "button";
          elGroupSelect.value = "Group "+elem_group_number;
          elGroupSelect.onclick = (function(e) { //lambda function!!
             return function() {rf_this.callback_elem_group_changed(e);};})(elem_group_number);

          cell_el.appendChild(elGroupSelect);
          cell_el.appendChild(document.createElement('br')); //add space between the two
        }
      } else {
         //just make next element column
         cell_el=row_el.insertCell(-1); 
      }
    }
    var ds=this.rrd_file.getDS(i);
    if (this.rrdflot_defaults.multi_ds) { //null==false in boolean ops
       var name=ds.getName()+"-"+ds.getType();
       var name2=ds.getName();
    }
    else {var name=ds.getName(); var name2=ds.getName();}
    var title=name; 
    if(this.rrdflot_defaults.use_checked_DSs) {
       if(this.rrdflot_defaults.checked_DSs.length==0) {
          var checked=(i==0); // only first checked by default
       } else{checked=false;}
    } else {var checked=(i==0);}
    if (this.ds_graph_options[name]!=null) {
      var dgo=this.ds_graph_options[name];
      if (dgo['title']!=null) {
	// if the user provided the title, use it
	title=dgo['title'];
      } else if (dgo['label']!=null) {
	// use label as a second choiceit
	title=dgo['label'];
      } // else leave the ds name
      if(this.rrdflot_defaults.use_checked_DSs) {
         if(this.rrdflot_defaults.checked_DSs.length==0) {
           // if the user provided the title, use it
           checked=dgo['checked'];
         }
      } else {
         if (dgo['checked']!=null) {
            checked=dgo['checked']; 
         }
      }
    }
    if(this.rrdflot_defaults.use_checked_DSs) {
       if(this.rrdflot_defaults.checked_DSs==null) {continue;}
       for(var j=0;j<this.rrdflot_defaults.checked_DSs.length;j++){
             if (name==this.rrdflot_defaults.checked_DSs[j]) {checked=true;}
       }
    }
    var cb_el = document.createElement("input");
    cb_el.type = "checkbox";
    cb_el.name = "ds";
    cb_el.value = name2;
    cb_el.checked = cb_el.defaultChecked = checked;
    cell_el.appendChild(cb_el);
    cell_el.appendChild(document.createTextNode(title));
    cell_el.appendChild(document.createElement('br'));
  }
  form_el.appendChild(table_el);
};

// ======================================
// 
rrdFlot.prototype.drawFlotGraph = function() {
  // Res contains the RRA idx
  var oSelect=document.getElementById(this.res_id);
  var rra_idx=Number(oSelect.options[oSelect.selectedIndex].value);
  selected_rra=rra_idx;
  if(this.rrdflot_defaults.use_rra) {
    oSelect.options[oSelect.selectedIndex].value = this.rrdflot_defaults.rra;
    rra_idx = this.rrdflot_defaults.rra;
  }

  // now get the list of selected DSs
  var ds_positive_stack_list=[];
  var ds_negative_stack_list=[];
  var ds_single_list=[];
  var ds_colors={};
  var oCB=document.getElementById(this.ds_cb_id);
  var nrDSs=oCB.ds.length;
  local_checked_DSs=[];
  if (oCB.ds.length>0) {
    for (var i=0; i<oCB.ds.length; i++) {
      if (oCB.ds[i].checked==true) {
	var ds_name=oCB.ds[i].value;
	var ds_stack_type='none';
        local_checked_DSs.push(ds_name);;
	if (this.ds_graph_options[ds_name]!=null) {
	  var dgo=this.ds_graph_options[ds_name];
	  if (dgo['stack']!=null) {
	    var ds_stack_type=dgo['stack'];
	  }
	}
	if (ds_stack_type=='positive') {
	  ds_positive_stack_list.push(ds_name);
	} else if (ds_stack_type=='negative') {
	  ds_negative_stack_list.push(ds_name);
	} else {
	  ds_single_list.push(ds_name);
	}
	ds_colors[ds_name]=i;
      }
    }
  } else { // single element is not treated as an array
    if (oCB.ds.checked==true) {
      // no sense trying to stack a single element
      var ds_name=oCB.ds.value;
      ds_single_list.push(ds_name);
      ds_colors[ds_name]=0;
      local_checked_DSs.push(ds_name);
    }
  }

  var timeSelect=document.getElementById(this.time_sel_id);
  timezone_shift=timeSelect.options[timeSelect.selectedIndex].value;

  // then extract RRA data about those DSs
  var flot_obj=rrdRRAStackFlotObj(this.rrd_file,rra_idx,
				  ds_positive_stack_list,ds_negative_stack_list,ds_single_list,
                                  timezone_shift*3600);

  // fix the colors, based on the position in the RRD
  for (var i=0; i<flot_obj.data.length; i++) {
    var name=flot_obj.data[i].label; // at this point, label is the ds_name
    var color=ds_colors[name]; // default color as defined above
    if (this.ds_graph_options[name]!=null) {
      var dgo=this.ds_graph_options[name];
      if (dgo['color']!=null) {
	color=dgo['color'];
      }
      if (dgo['label']!=null) {
	// if the user provided the label, use it
	flot_obj.data[i].label=dgo['label'];
      } else  if (dgo['title']!=null) {
	// use title as a second choice 
	flot_obj.data[i].label=dgo['title'];
      } // else use the ds name
      if (dgo['lines']!=null) {
	// if the user provided the label, use it
	flot_obj.data[i].lines=dgo['lines'];
      }
      if (dgo['yaxis']!=null) {
	// if the user provided the label, use it
	flot_obj.data[i].yaxis=dgo['yaxis'];
      }
    }
    flot_obj.data[i].color=color;
  }

  // finally do the real plotting
  this.bindFlotGraph(flot_obj);
};

// ======================================
// Bind the graphs to the HTML tags
rrdFlot.prototype.bindFlotGraph = function(flot_obj) {
  var rf_this=this; // use obj inside other functions

  // Legend
  var oSelect=document.getElementById(this.legend_sel_id);
  var legend_id=oSelect.options[oSelect.selectedIndex].value;
  var graph_jq_id="#"+this.graph_id;
  var scale_jq_id="#"+this.scale_id;

  var graph_options = {
    legend: {show:false, position:"nw",noColumns:3},
    lines: {show:true},
    xaxis: { mode: "time" },
    yaxis: { autoscaleMargin: 0.20},
    selection: { mode: "x" },
    tooltip: true,
    tooltipOpts: { content: "<h4>%s</h4> Value: %y.3" },
    grid: { hoverable: true },
  };
  
  if (legend_id=="None") {
    // do nothing
  } else {
    graph_options.legend.show=true;
    graph_options.legend.position=legend_id;
  }

  if (this.graph_options!=null) {
    graph_options=populateGraphOptions(graph_options,this.graph_options);
  }

  if (graph_options.tooltip==false) {
    // avoid the need for the caller specify both
    graph_options.grid.hoverable=false;
  }

  if (this.selection_range.isSet()) {
    var selection_range=this.selection_range.getFlotRanges();
    if(this.rrdflot_defaults.use_windows) {
       graph_options.xaxis.min = this.rrdflot_defaults.window_min;  
       graph_options.xaxis.max = this.rrdflot_defaults.window_max;  
    } else {
    graph_options.xaxis.min=selection_range.xaxis.from;
    graph_options.xaxis.max=selection_range.xaxis.to;
    }
  } else if(this.rrdflot_defaults.use_windows) {
    graph_options.xaxis.min = this.rrdflot_defaults.window_min;  
    graph_options.xaxis.max = this.rrdflot_defaults.window_max;  
  } else {
    graph_options.xaxis.min=flot_obj.min;
    graph_options.xaxis.max=flot_obj.max;
  }

  var scale_options = {
    legend: {show:false},
    lines: {show:true},
    xaxis: {mode: "time", min:flot_obj.min, max:flot_obj.max },
    yaxis: graph_options.yaxis,
    selection: { mode: "x" },
  };

  //this.selection_range.selection_min=flot_obj.min;
  //this.selection_range.selection_max=flot_obj.max;

  var flot_data=flot_obj.data;
  var graph_data=this.selection_range.trim_flot_data(flot_data);
  var scale_data=flot_data;

  this.graph = $.plot($(graph_jq_id), graph_data, graph_options);
  this.scale = $.plot($(scale_jq_id), scale_data, scale_options);
 
  
  if(this.rrdflot_defaults.use_windows) {
    ranges = {};
    ranges.xaxis = [];
    ranges.xaxis.from = this.rrdflot_defaults.window_min;
    ranges.xaxis.to = this.rrdflot_defaults.window_max;
    rf_this.scale.setSelection(ranges,true);
    window_min = ranges.xaxis.from;
    window_max = ranges.xaxis.to;
  }

  if (this.selection_range.isSet()) {
    this.scale.setSelection(this.selection_range.getFlotRanges(),true); //don't fire event, no need
  }

  // now connect the two    
  $(graph_jq_id).unbind("plotselected"); // but first remove old function
  $(graph_jq_id).bind("plotselected", function (event, ranges) {
      // do the zooming
      rf_this.selection_range.setFromFlotRanges(ranges);
      graph_options.xaxis.min=ranges.xaxis.from;
      graph_options.xaxis.max=ranges.xaxis.to;
      window_min = ranges.xaxis.from;
      window_max = ranges.xaxis.to;
      rf_this.graph = $.plot($(graph_jq_id), rf_this.selection_range.trim_flot_data(flot_data), graph_options);
      
      // don't fire event on the scale to prevent eternal loop
      rf_this.scale.setSelection(ranges, true); //puts the transparent window on minigraph
  });
   
  $(scale_jq_id).unbind("plotselected"); //same here 
  $(scale_jq_id).bind("plotselected", function (event, ranges) {
      rf_this.graph.setSelection(ranges);
  });

  // only the scale has a selection
  // so when that is cleared, redraw also the graph
  $(scale_jq_id).bind("plotunselected", function() {
      rf_this.selection_range.reset();
      graph_options.xaxis.min=flot_obj.min;
      graph_options.xaxis.max=flot_obj.max;
      rf_this.graph = $.plot($(graph_jq_id), rf_this.selection_range.trim_flot_data(flot_data), graph_options);
      window_min = 0;
      window_max = 0;
  });
};

// callback functions that are called when one of the selections changes
rrdFlot.prototype.callback_res_changed = function() {
  this.rrdflot_defaults.use_rra = false;
  this.drawFlotGraph();
};

rrdFlot.prototype.callback_ds_cb_changed = function() {
  this.drawFlotGraph();
};

rrdFlot.prototype.callback_scale_reset = function() {
  this.scale.clearSelection();
};

rrdFlot.prototype.callback_legend_changed = function() {
  this.drawFlotGraph();
};

rrdFlot.prototype.callback_timezone_changed = function() {
  this.drawFlotGraph();
};

rrdFlot.prototype.callback_elem_group_changed = function(num) { //,window_min,window_max) {

  var oCB=document.getElementById(this.ds_cb_id);
  var nrDSs=oCB.ds.length;
  if (oCB.ds.length>0) {
    for (var i=0; i<oCB.ds.length; i++) {
      if(Math.floor(i/this.rrdflot_defaults.num_cb_rows)==num-1) {oCB.ds[i].checked=true; }
      else {oCB.ds[i].checked=false;}
    }
  }
  this.drawFlotGraph()
};

function getGraphInfo() {
   var graph_info = {};
   graph_info['dss'] = local_checked_DSs;
   graph_info['rra'] = selected_rra;
   graph_info['window_min'] = window_min;
   graph_info['window_max'] = window_max;
   graph_info['timezone'] = timezone_shift;
   return graph_info;
};

function resetWindow() {
  window_min = 0;
  window_max = 0; 
};

function populateGraphOptions(me, other) {
  for (e in other) {
    if (me[e]!=undefined) {
      if (Object.prototype.toString.call(other[e])=="[object Object]") {
	me[e]=populateGraphOptions(me[e],other[e]);
      } else {
	me[e]=other[e];
      }
    } else {
      /// create a new one
      if (Object.prototype.toString.call(other[e])=="[object Object]") {
	// This will do a deep copy
	me[e]=populateGraphOptions({},other[e]);
      } else {
	me[e]=other[e];
      }
    }
  }
  return me;
};
/*
 * RRD graphing libraries, based on Flot
 * Part of the javascriptRRD package
 * Copyright (c) 2010 Frank Wuerthwein, fkw@ucsd.edu
 *                    Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 *
 * Flot is a javascript plotting library developed and maintained by
 * Ole Laursen [http://www.flotcharts.org/]
 *
 */

/*
 * The rrd_files is a list of 
 *  [rrd_id,rrd_file] pairs
 * All rrd_files must have the same step, the same DSes and the same number of RRAs.
 *
 */ 

/*
 * The ds_list is a list of 
 *  [ds_id, ds_title] pairs
 * If not defined, the list will be created from the RRDs
 *
 */ 

/*
 * Local dependencies:
 *  rrdFlotSupport.py
 *
 * External dependencies:
 *  [Flot]/jquery.py
 *  [Flot]/jquery.flot.js
 *  [Flot]/jquery.flot.selection.js
 */

/* graph_options defaults (see Flot docs for details)
 * {
 *  legend: { position:"nw",noColumns:3},
 *  lines: { show:true },
 *  yaxis: { autoscaleMargin: 0.20}
 * }
 *
 * rrd_graph_options is a dictionary of rrd_id, 
 *   with each element being a graph_option
 *   The defaults for each element are
 *   {
 *     title: label  or rrd_name                          // this is what is displayed in the checkboxes
 *     checked: true                                      // boolean
 *     label: title or rrd_name                           // this is what is displayed in the legend
 *     color: rrd_index                                   // see Flot docs for details
 *     lines: { show:true, fill: true, fillColor:color }  // see Flot docs for details
 *   }
 *
 * //overwrites other defaults; mostly used for linking via the URL
 * rrdflot_defaults defaults (see Flot docs for details) 	 
 * {
 *    graph_only: false        // If true, limit the display to the graph only
 *    legend: "Top"            //Starting location of legend. Options are: 
 *                             //   "Top","Bottom","TopRight","BottomRight","None".
 *    num_cb_rows: 12          //How many rows of DS checkboxes per column.
 *    use_element_buttons: false  //To be used in conjunction with num_cb_rows: This option
 *                             //    creates a button above every column, which selects
 *                             //    every element in the column. 
 *    multi_rra: false         //"true" appends the name of the RRA consolidation function (CF) 
 *                             //    (AVERAGE, MIN, MAX or LAST) to the name of the RRA. Useful 
 *                             //    for RRAs over the same interval with different CFs.  
 *    use_checked_RRDs: false   //Use the list checked_RRDs below.
 *    checked_RRDs: []          //List of elements to be checked by default when graph is loaded. 
 *                             //    Overwrites graph options. 
 *    use_rra: false           //Whether to use the rra index specified below.
 *    rra: 0                   //RRA (rra index in rrd) to be selected when graph is loaded. 
 *    use_windows: false       //Whether to use the window zoom specifications below.
 *    window_min: 0            //Sets minimum for window zoom. X-axis usually in unix time. 
 *    window_max: 0            //Sets maximum for window zoom.
 *    graph_height: "300px"    //Height of main graph. 
 *    graph_width: "500px"     //Width of main graph.
 *    scale_height: "110px"    //Height of small scaler graph.
 *    scale_width: "250px"     //Width of small scaler graph.
 * } 
 */

var local_checked_RRDs = [];
var selected_rra = 0;
var window_min=0;
var window_max=0;
var elem_group=null;


function rrdFlotMatrix(html_id, rrd_files, ds_list, graph_options, rrd_graph_options,rrdflot_defaults) {
  this.html_id=html_id;
  this.rrd_files=rrd_files;
  if (rrdflot_defaults==null) {
    this.rrdflot_defaults=new Object(); // empty object, just not to be null
  } else {
    this.rrdflot_defaults=rrdflot_defaults;
  }
  if (ds_list==null) {
    this.ds_list=[];
    var rrd_file=this.rrd_files[0][1]; // get the first one... they are all the same
    var nrDSs=rrd_file.getNrDSs();
    for (var i=0; i<nrDSs; i++) {
      var ds=this.rrd_files[0][1].getDS(i);
      var name=ds.getName();
      this.ds_list.push([name,name]);
    }
  } else {
    this.ds_list=ds_list;
  }
  this.graph_options=graph_options;
  if (rrd_graph_options==null) {
    this.rrd_graph_options=new Object(); // empty object, just not to be null
  } else {
    this.rrd_graph_options=rrd_graph_options;
  }
  this.selection_range=new rrdFlotSelection();

  this.createHTML();
  this.populateDS();
  this.populateRes();
  this.populateRRDcb();
  this.drawFlotGraph()

  if (this.rrdflot_defaults.graph_only==true) {
    this.cleanHTMLCruft();
  }
}


// ===============================================
// Create the HTML tags needed to host the graphs
rrdFlotMatrix.prototype.createHTML = function() {
  var rf_this=this; // use obj inside other functions

  var base_el=document.getElementById(this.html_id);

  this.ds_id=this.html_id+"_ds";
  this.res_id=this.html_id+"_res";
  this.rrd_cb_id=this.html_id+"_rrd_cb";
  this.graph_id=this.html_id+"_graph";
  this.scale_id=this.html_id+"_scale";
  this.legend_sel_id=this.html_id+"_legend_sel";

  // First clean up anything in the element
  while (base_el.lastChild!=null) base_el.removeChild(base_el.lastChild);

  // Now create the layout
  var external_table=document.createElement("Table");
  this.external_table=external_table;

  // DS rows: select DS
  var rowDS=external_table.insertRow(-1);
  var cellDS=rowDS.insertCell(-1);
  cellDS.colSpan=4
  cellDS.appendChild(document.createTextNode("Element:"));
  var forDS=document.createElement("Select");
  forDS.id=this.ds_id;
  forDS.onchange= function () {rf_this.callback_ds_changed();};
  cellDS.appendChild(forDS);

  // Header row: resulution select and DS selection title
  var rowHeader=external_table.insertRow(-1);
  var cellRes=rowHeader.insertCell(-1);
  cellRes.colSpan=3;
  cellRes.appendChild(document.createTextNode("Resolution:"));
  var forRes=document.createElement("Select");
  forRes.id=this.res_id;
  forRes.onchange= function () {rf_this.callback_res_changed();};
  cellRes.appendChild(forRes);

  var cellRRDTitle=rowHeader.insertCell(-1);
  cellRRDTitle.appendChild(document.createTextNode("Select RRDs to plot:"));

  // Graph row: main graph and DS selection block
  var rowGraph=external_table.insertRow(-1);
  var cellGraph=rowGraph.insertCell(-1);
  cellGraph.colSpan=3;
  var elGraph=document.createElement("Div");
  if(this.rrdflot_defaults.graph_width!=null) {
     elGraph.style.width=this.rrdflot_defaults.graph_width;
  } else {elGraph.style.width="500px";}
  if(this.rrdflot_defaults.graph_height!=null) {
     elGraph.style.height=this.rrdflot_defaults.graph_height;
  } else {elGraph.style.height="300px";}
  elGraph.id=this.graph_id;
  cellGraph.appendChild(elGraph);

  var cellRRDcb=rowGraph.insertCell(-1);
  cellRRDcb.vAlign="top";
  var formRRDcb=document.createElement("Form");
  formRRDcb.id=this.rrd_cb_id;
  formRRDcb.onchange= function () {rf_this.callback_rrd_cb_changed();};
  cellRRDcb.appendChild(formRRDcb);

  // Scale row: scaled down selection graph
  var rowScale=external_table.insertRow(-1);

  var cellScaleLegend=rowScale.insertCell(-1);
  cellScaleLegend.vAlign="top";
  cellScaleLegend.appendChild(document.createTextNode("Legend:"));
  cellScaleLegend.appendChild(document.createElement('br'));
  var forScaleLegend=document.createElement("Select");
  forScaleLegend.id=this.legend_sel_id;
  forScaleLegend.appendChild(new Option("Top","nw",this.rrdflot_defaults.legend=="Top",this.rrdflot_defaults.legend=="Top"));
  forScaleLegend.appendChild(new Option("Bottom","sw",this.rrdflot_defaults.legend=="Bottom",this.rrdflot_defaults.legend=="Bottom"));
  forScaleLegend.appendChild(new Option("TopRight","ne",this.rrdflot_defaults.legend=="TopRight",this.rrdflot_defaults.legend=="TopRight"));
  forScaleLegend.appendChild(new Option("BottomRight","se",this.rrdflot_defaults.legend=="BottomRight",this.rrdflot_defaults.legend=="BottomRight"));
  forScaleLegend.appendChild(new Option("None","None",this.rrdflot_defaults.legend=="None",this.rrdflot_defaults.legend=="None"));
  forScaleLegend.onchange= function () {rf_this.callback_legend_changed();};
  cellScaleLegend.appendChild(forScaleLegend);

  var cellScale=rowScale.insertCell(-1);
  cellScale.align="right";
  var elScale=document.createElement("Div");
  if(this.rrdflot_defaults.scale_width!=null) {
     elScale.style.width=this.rrdflot_defaults.scale_width;
  } else {elScale.style.width="250px";}
  if(this.rrdflot_defaults.scale_height!=null) {
     elScale.style.height=this.rrdflot_defaults.scale_height;
  } else {elScale.style.height="110px";}
  elScale.id=this.scale_id;
  cellScale.appendChild(elScale);
  
  var cellScaleReset=rowScale.insertCell(-1);
  cellScaleReset.vAlign="top";
  cellScaleReset.appendChild(document.createTextNode(" "));
  cellScaleReset.appendChild(document.createElement('br'));
  var elScaleReset=document.createElement("input");
  elScaleReset.type = "button";
  elScaleReset.value = "Reset selection";
  elScaleReset.onclick = function () {rf_this.callback_scale_reset();}
  cellScaleReset.appendChild(elScaleReset);


  base_el.appendChild(external_table);
};

// ===============================================
// Remove all HTMl elements but the graph
rrdFlotMatrix.prototype.cleanHTMLCruft = function() {
  var rf_this=this; // use obj inside other functions

  // delete 2 top and 1 bottom rows... graph is in the middle
  this.external_table.deleteRow(-1);
  this.external_table.deleteRow(0);
  this.external_table.deleteRow(0);

  var rrd_el=document.getElementById(this.rrd_cb_id);
  rrd_el.removeChild(rrd_el.lastChild);
}

// ======================================
// Populate DSs, RRA and RRD info
rrdFlotMatrix.prototype.populateDS = function() {
  var form_el=document.getElementById(this.ds_id);

  // First clean up anything in the element
  while (form_el.lastChild!=null) form_el.removeChild(form_el.lastChild);

  for (i in this.ds_list) {
    var ds=this.ds_list[i];
    form_el.appendChild(new Option(ds[1],ds[0]));
  }
};

rrdFlotMatrix.prototype.populateRes = function() {
  var form_el=document.getElementById(this.res_id);

  // First clean up anything in the element
  while (form_el.lastChild!=null) form_el.removeChild(form_el.lastChild);

  var rrd_file=this.rrd_files[0][1]; // get the first one... they are all the same
  // now populate with RRA info
  var nrRRAs=rrd_file.getNrRRAs();
  for (var i=0; i<nrRRAs; i++) {
    var rra=rrd_file.getRRAInfo(i);
    var step=rra.getStep();
    var rows=rra.getNrRows();
    var period=step*rows;
    var rra_label=rfs_format_time(step)+" ("+rfs_format_time(period)+" total)";
    if (this.rrdflot_defaults.multi_rra) rra_label+=" "+rra.getCFName();
    form_el.appendChild(new Option(rra_label,i));
  }
  if(this.rrdflot_defaults.use_rra) {form_el.selectedIndex = this.rrdflot_defaults.rra;}
};

rrdFlotMatrix.prototype.populateRRDcb = function() {
  var rf_this=this; // use obj inside other functions
  var form_el=document.getElementById(this.rrd_cb_id);
 
  //Create a table within a table to arrange
  // checkbuttons into two or more columns
  var table_el=document.createElement("Table");
  var row_el=table_el.insertRow(-1);
  row_el.vAlign="top";
  var cell_el=null; // will define later

  if (this.rrdflot_defaults.num_cb_rows==null) {
     this.rrdflot_defaults.num_cb_rows=12; 
  }
  // now populate with RRD info
  var nrRRDs=this.rrd_files.length;
  var elem_group_number = 0;
 
  for (var i=0; i<nrRRDs; i++) {

    if ((i%this.rrdflot_defaults.num_cb_rows)==0) { // one column every x RRDs
      if(this.rrdflot_defaults.use_element_buttons) {
        cell_el=row_el.insertCell(-1); //make next element column 
        if(nrRRDs>this.rrdflot_defaults.num_cb_rows) { //if only one column, no need for a button
          elem_group_number = (i/this.rrdflot_defaults.num_cb_rows)+1;
          var elGroupSelect = document.createElement("input");
          elGroupSelect.type = "button";
          elGroupSelect.value = "Group "+elem_group_number;
          elGroupSelect.onclick = (function(e) { //lambda function!!
             return function() {rf_this.callback_elem_group_changed(e);};})(elem_group_number);

          cell_el.appendChild(elGroupSelect);
          cell_el.appendChild(document.createElement('br')); //add space between the two
        }
      } else {
         //just make next element column
         cell_el=row_el.insertCell(-1); 
      }
    }

    var rrd_el=this.rrd_files[i];
    var rrd_file=rrd_el[1];
    var name=rrd_el[0];
    var title=name;
 
    if(this.rrdflot_defaults.use_checked_RRDs) {
       if(this.rrdflot_defaults.checked_RRDs.length==0) {
          var checked=(i==0); // only first checked by default
       } else{checked=false;}
    } else {var checked=(i==0);}
    if (this.rrd_graph_options[name]!=null) {
      var rgo=this.rrd_graph_options[name];
      if (rgo['title']!=null) {
	// if the user provided the title, use it
	title=rgo['title'];
      } else if (rgo['label']!=null) {
	// use label as a second choiceit
	title=rgo['label'];
      } // else leave the rrd name
      if(this.rrdflot_defaults.use_checked_RRDs) {
         if(this.rrdflot_defaults.checked_RRDs.length==0) {
           // if the user provided the title, use it
           checked=rgo['checked'];
         }
      } else {
         if (rgo['checked']!=null) {
            checked=rgo['checked']; 
         }
      }
    }
    if(this.rrdflot_defaults.use_checked_RRDs) {
       if(this.rrdflot_defaults.checked_RRDs==null) {continue;}
       for(var j=0;j<this.rrdflot_defaults.checked_RRDs.length;j++){
             if (name==this.rrdflot_defaults.checked_RRDs[j]) {checked=true;}
       }
    }
    var cb_el = document.createElement("input");
    cb_el.type = "checkbox";
    cb_el.name = "rrd";
    cb_el.value = i;
    cb_el.checked = cb_el.defaultChecked = checked;
    cell_el.appendChild(cb_el);
    cell_el.appendChild(document.createTextNode(title));
    cell_el.appendChild(document.createElement('br'));
  }
  form_el.appendChild(table_el);
};

// ======================================
// 
rrdFlotMatrix.prototype.drawFlotGraph = function() {
  // DS
  var oSelect=document.getElementById(this.ds_id);
  var ds_id=oSelect.options[oSelect.selectedIndex].value;

  // Res contains the RRA idx
  oSelect=document.getElementById(this.res_id);
  var rra_idx=Number(oSelect.options[oSelect.selectedIndex].value);

  selected_rra=rra_idx;
  if(this.rrdflot_defaults.use_rra) {
    oSelect.options[oSelect.selectedIndex].value = this.rrdflot_defaults.rra;
    rra_idx = this.rrdflot_defaults.rra;
  }

  // Extract ds info ... to be finished
  var ds_positive_stack=null;

  var std_colors=["#00ff00","#00ffff","#0000ff","#ff00ff",
		  "#808080","#ff0000","#ffff00","#e66266",
		  "#33cccc","#fff8a9","#ccffff","#a57e81",
		  "#7bea81","#8d4dff","#ffcc99","#000000"];

  // now get the list of selected RRDs
  var rrd_list=[];
  var rrd_colors=[];
  var oCB=document.getElementById(this.rrd_cb_id);
  var nrRRDs=oCB.rrd.length;
  if (oCB.rrd.length>0) {
    for (var i=0; i<oCB.rrd.length; i++) {
      if (oCB.rrd[i].checked==true) {
	//var rrd_idx=Number(oCB.rrd[i].value);
	rrd_list.push(this.rrd_files[i]);
	color=std_colors[i%std_colors.length];
	if ((i/std_colors.length)>=1) {
	  // wraparound, change them a little
	  idiv=Math.floor(i/std_colors.length);
	  c1=parseInt(color[1]+color[2],16);
	  c2=parseInt(color[3]+color[4],16);
	  c3=parseInt(color[5]+color[6],16);
	  m1=Math.floor((c1-128)/Math.sqrt(idiv+1))+128;
	  m2=Math.floor((c2-128)/Math.sqrt(idiv+1))+128;
	  m3=Math.floor((c3-128)/Math.sqrt(idiv+1))+128;
	  if (m1>15) s1=(m1).toString(16); else s1="0"+(m1).toString(16);
	  if (m2>15) s2=(m2).toString(16); else s2="0"+(m2).toString(16);
	  if (m3>15) s3=(m3).toString(16); else s3="0"+(m3).toString(16);
	  color="#"+s1+s2+s3;
	}
        rrd_colors.push(color);
      }
    }
  } else { // single element is not treated as an array
    if (oCB.rrd.checked==true) {
      // no sense trying to stack a single element
      rrd_list.push(this.rrd_files[0]);
      rrd_colors.push(std_colors[0]);
    }
  }
  
  // then extract RRA data about those DSs... to be finished
  var flot_obj=rrdRRAMultiStackFlotObj(rrd_list,rra_idx,ds_id);

  // fix the colors, based on the position in the RRD
  for (var i=0; i<flot_obj.data.length; i++) {
    var name=flot_obj.data[i].label; // at this point, label is the rrd_name
    var color=rrd_colors[flot_obj.data.length-i-1]; // stack inverts colors
    var lines=null;
    if (this.rrd_graph_options[name]!=null) {
      var dgo=this.rrd_graph_options[name];
      if (dgo['color']!=null) {
	color=dgo['color'];
      }
      if (dgo['label']!=null) {
	// if the user provided the label, use it
	flot_obj.data[i].label=dgo['label'];
      } else  if (dgo['title']!=null) {
	// use title as a second choice 
	flot_obj.data[i].label=dgo['title'];
      } // else use the rrd name
      if (dgo['lines']!=null) {
	// if the user provided the label, use it
	flot_obj.data[i].lines=dgo['lines'];
      }
    }
    if (lines==null) {
	flot_obj.data[i].lines= { show:true, fill: true, fillColor:color };
    }
    flot_obj.data[i].color=color;
  }

  // finally do the real plotting
  this.bindFlotGraph(flot_obj);
};

// ======================================
// Bind the graphs to the HTML tags
rrdFlotMatrix.prototype.bindFlotGraph = function(flot_obj) {
  var rf_this=this; // use obj inside other functions

  // Legend
  var oSelect=document.getElementById(this.legend_sel_id);
  var legend_id=oSelect.options[oSelect.selectedIndex].value;
  var graph_jq_id="#"+this.graph_id;
  var scale_jq_id="#"+this.scale_id;

  var graph_options = {
    legend: {show:false, position:"nw",noColumns:3},
    lines: {show:true},
    xaxis: { mode: "time" },
    yaxis: { autoscaleMargin: 0.20},
    selection: { mode: "x" },
    tooltip: true,
    tooltipOpts: { content: "<h4>%s</h4> Value: %y.3" },
    grid: { hoverable: true },
  };
  
  if (legend_id=="None") {
    // do nothing
  } else {
    graph_options.legend.show=true;
    graph_options.legend.position=legend_id;
  }

  if (this.graph_options!=null) {
    graph_options=populateGraphOptions(graph_options,this.graph_options);
  }

  if (graph_options.tooltip==false) {
    // avoid the need for the caller specify both
    graph_options.grid.hoverable=false;
  }


  if (this.selection_range.isSet()) {
    var selection_range=this.selection_range.getFlotRanges();
    if(this.rrdflot_defaults.use_windows) {
       graph_options.xaxis.min = this.rrdflot_defaults.window_min;  
       graph_options.xaxis.max = this.rrdflot_defaults.window_max;  
    } else {
    graph_options.xaxis.min=selection_range.xaxis.from;
    graph_options.xaxis.max=selection_range.xaxis.to;
    }
  } else if(this.rrdflot_defaults.use_windows) {
    graph_options.xaxis.min = this.rrdflot_defaults.window_min;  
    graph_options.xaxis.max = this.rrdflot_defaults.window_max;  
  } else {
    graph_options.xaxis.min=flot_obj.min;
    graph_options.xaxis.max=flot_obj.max;
  }

  var scale_options = {
    legend: {show:false},
    lines: {show:true},
    xaxis: { mode: "time", min:flot_obj.min, max:flot_obj.max },
    selection: { mode: "x" },
  };
    
  var flot_data=flot_obj.data;

  var graph_data=this.selection_range.trim_flot_data(flot_data);
  var scale_data=flot_data;

  this.graph = $.plot($(graph_jq_id), graph_data, graph_options);
  this.scale = $.plot($(scale_jq_id), scale_data, scale_options);

  if(this.rrdflot_defaults.use_windows) {
    ranges = {};
    ranges.xaxis = [];
    ranges.xaxis.from = this.rrdflot_defaults.window_min;
    ranges.xaxis.to = this.rrdflot_defaults.window_max;
    rf_this.scale.setSelection(ranges,true);
    window_min = ranges.xaxis.from;
    window_max = ranges.xaxis.to;
  }

  if (this.selection_range.isSet()) {
    this.scale.setSelection(this.selection_range.getFlotRanges(),true); //don't fire event, no need
  }

  // now connect the two    
  $(graph_jq_id).bind("plotselected", function (event, ranges) {
      // do the zooming
      rf_this.selection_range.setFromFlotRanges(ranges);
      graph_options.xaxis.min=ranges.xaxis.from;
      graph_options.xaxis.max=ranges.xaxis.to;
      window_min = ranges.xaxis.from;
      window_max = ranges.xaxis.to;
      rf_this.graph = $.plot($(graph_jq_id), rf_this.selection_range.trim_flot_data(flot_data), graph_options);
      
      // don't fire event on the scale to prevent eternal loop
      rf_this.scale.setSelection(ranges, true);
  });
    
  $(scale_jq_id).bind("plotselected", function (event, ranges) {
      rf_this.graph.setSelection(ranges);
  });

  // only the scale has a selection
  // so when that is cleared, redraw also the graph
  $(scale_jq_id).bind("plotunselected", function() {
      rf_this.selection_range.reset();
      graph_options.xaxis.min=flot_obj.min;
      graph_options.xaxis.max=flot_obj.max;
      rf_this.graph = $.plot($(graph_jq_id), rf_this.selection_range.trim_flot_data(flot_data), graph_options);
  });
};

// callback functions that are called when one of the selections changes
rrdFlotMatrix.prototype.callback_res_changed = function() {
  this.drawFlotGraph();
};

rrdFlotMatrix.prototype.callback_ds_changed = function() {
  this.drawFlotGraph();
};

rrdFlotMatrix.prototype.callback_rrd_cb_changed = function() {
  this.drawFlotGraph();
};

rrdFlotMatrix.prototype.callback_scale_reset = function() {
  this.scale.clearSelection();
};

rrdFlotMatrix.prototype.callback_legend_changed = function() {
  this.drawFlotGraph();
};

rrdFlotMatrix.prototype.callback_elem_group_changed = function(num) { 

  var oCB=document.getElementById(this.rrd_cb_id);
  var nrRRDs=oCB.rrd.length;
  if (oCB.rrd.length>0) {
    for (var i=0; i<oCB.rrd.length; i++) {
      if(Math.floor(i/this.rrdflot_defaults.num_cb_rows)==num-1) {oCB.rrd[i].checked=true; }
      else {oCB.rrd[i].checked=false;}
    }
  }
  this.drawFlotGraph()
};

function populateGraphOptions(me, other) {
  for (e in other) {
    if (me[e]!=undefined) {
      if (Object.prototype.toString.call(other[e])=="[object Object]") {
	me[e]=populateGraphOptions(me[e],other[e]);
      } else {
	me[e]=other[e];
      }
    } else {
      /// create a new one
      if (Object.prototype.toString.call(other[e])=="[object Object]") {
	// This will do a deep copy
	me[e]=populateGraphOptions({},other[e]);
      } else {
	me[e]=other[e];
      }
    }
  }
  return me;
};
/*
 * Filter classes for rrdFile
 * They implement the same interface, but changing the content
 * 
 * Part of the javascriptRRD package
 * Copyright (c) 2009 Frank Wuerthwein, fkw@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 * All filter classes must implement the following interface:
 *     getMinStep()
 *     getLastUpdate()
 *     getNrRRAs()
 *     getRRAInfo(rra_idx)
 *     getFilterRRA(rra_idx)
 *     getName()
 *
 * Where getFilterRRA returns an object implementing the following interface:
 *     getIdx()
 *     getNrRows()
 *     getStep()
 *     getCFName()
 *     getEl(row_idx)
 *     getElFast(row_idx)
 *
 */


// ================================================================
// Filter out a subset of DSs (identified either by idx or by name)

// Internal
function RRDRRAFilterDS(rrd_rra,ds_list) {
  this.rrd_rra=rrd_rra;
  this.ds_list=ds_list;
}
RRDRRAFilterDS.prototype.getIdx = function() {return this.rrd_rra.getIdx();}
RRDRRAFilterDS.prototype.getNrRows = function() {return this.rrd_rra.getNrRows();}
RRDRRAFilterDS.prototype.getNrDSs = function() {return this.ds_list.length;}
RRDRRAFilterDS.prototype.getStep = function() {return this.rrd_rra.getStep();}
RRDRRAFilterDS.prototype.getCFName = function() {return this.rrd_rra.getCFName();}
RRDRRAFilterDS.prototype.getEl = function(row_idx,ds_idx) {
  if ((ds_idx>=0) && (ds_idx<this.ds_list.length)) {
    var real_ds_idx=this.ds_list[ds_idx].real_ds_idx;
    return this.rrd_rra.getEl(row_idx,real_ds_idx);
  } else {
    throw RangeError("DS idx ("+ ds_idx +") out of range [0-" + this.ds_list.length +").");
  }	
}
RRDRRAFilterDS.prototype.getElFast = function(row_idx,ds_idx) {
  if ((ds_idx>=0) && (ds_idx<this.ds_list.length)) {
    var real_ds_idx=this.ds_list[ds_idx].real_ds_idx;
    return this.rrd_rra.getElFast(row_idx,real_ds_idx);
  } else {
    throw RangeError("DS idx ("+ ds_idx +") out of range [0-" + this.ds_list.length +").");
  }	
}

// --------------------------------------------------
// Public
// NOTE: This class is deprecated, use RRDFilterOp instead
function RRDFilterDS(rrd_file,ds_id_list) {
  this.rrd_file=rrd_file;
  this.ds_list=[];
  for (var i=0; i<ds_id_list.length; i++) {
    var org_ds=rrd_file.getDS(ds_id_list[i]);
    // must create a new copy, as the index has changed
    var new_ds=new RRDDS(org_ds.rrd_data,org_ds.rrd_data_idx,i);
    // then extend it to include the real RRD index
    new_ds.real_ds_idx=org_ds.my_idx;

    this.ds_list.push(new_ds);
  }
}
RRDFilterDS.prototype.getMinStep = function() {return this.rrd_file.getMinStep();}
RRDFilterDS.prototype.getLastUpdate = function() {return this.rrd_file.getLastUpdate();}

RRDFilterDS.prototype.getNrDSs = function() {return this.ds_list.length;}
RRDFilterDS.prototype.getDSNames = function() {
  var ds_names=[];
  for (var i=0; i<this.ds_list.length; i++) {
    ds_names.push(ds_list[i].getName());
  }
  return ds_names;
}
RRDFilterDS.prototype.getDS = function(id) {
  if (typeof id == "number") {
    return this.getDSbyIdx(id);
  } else {
    return this.getDSbyName(id);
  }
}

// INTERNAL: Do not call directly
RRDFilterDS.prototype.getDSbyIdx = function(idx) {
  if ((idx>=0) && (idx<this.ds_list.length)) {
    return this.ds_list[idx];
  } else {
    throw RangeError("DS idx ("+ idx +") out of range [0-" + this.ds_list.length +").");
  }	
}

// INTERNAL: Do not call directly
RRDFilterDS.prototype.getDSbyName = function(name) {
  for (var idx=0; idx<this.ds_list.length; idx++) {
    var ds=this.ds_list[idx];
    var ds_name=ds.getName()
    if (ds_name==name)
      return ds;
  }
  throw RangeError("DS name "+ name +" unknown.");
}

RRDFilterDS.prototype.getNrRRAs = function() {return this.rrd_file.getNrRRAs();}
RRDFilterDS.prototype.getRRAInfo = function(idx) {return this.rrd_file.getRRAInfo(idx);}
RRDFilterDS.prototype.getRRA = function(idx) {return new RRDRRAFilterDS(this.rrd_file.getRRA(idx),this.ds_list);}

// ================================================================
// Filter out by using a user provided filter object
// The object must implement the following interface
//   getName()               - Symbolic name give to this function
//   getDSName()             - list of DSs used in computing the result (names or indexes)
//   computeResult(val_list) - val_list contains the values of the requested DSs (in the same order) 

// If the element is a string or a number, it will just use that ds

// Example class that implements the interface:
//   function DoNothing(ds_name) { //Leaves the DS alone.
//     this.getName = function() {return ds_name;}
//     this.getDSNames = function() {return [ds_name];}
//     this.computeResult = function(val_list) {return val_list[0];}
//   }
//   function sumDS(ds1_name,ds2_name) { //Sums the two DSs.
//     this.getName = function() {return ds1_name+"+"+ds2_name;}
//     this.getDSNames = function() {return [ds1_name,ds2_name];}
//     this.computeResult = function(val_list) {return val_list[0]+val_list[1];}
//   }
//
// So to add a summed DS of your 1st and second DS: 
// var ds0_name = rrd_data.getDS(0).getName();
// var ds1_name = rrd_data.getDS(1).getName();
// rrd_data = new RRDFilterOp(rrd_data, [new DoNothing(ds0_name), 
//                DoNothing(ds1_name), sumDS(ds0_name, ds1_name]);
//
// You get the same resoult with
// rrd_data = new RRDFilterOp(rrd_data, [ds0_name,1,new sumDS(ds0_name, ds1_name)]);
////////////////////////////////////////////////////////////////////

// this implements the conceptual NoNothing above
function RRDFltOpIdent(ds_name) {
     this.getName = function() {return ds_name;}
     this.getDSNames = function() {return [ds_name];}
     this.computeResult = function(val_list) {return val_list[0];}
}

// similar to the above, but extracts the name from the index
// requires two parametes, since it it need context
function RRDFltOpIdentId(rrd_data,id) {
     this.ds_name=rrd_data.getDS(id).getName();
     this.getName = function() {return this.ds_name;}
     this.getDSNames = function() {return [this.ds_name];}
     this.computeResult = function(val_list) {return val_list[0];}
}

//Private
function RRDDSFilterOp(rrd_file,op_obj,my_idx) {
  this.rrd_file=rrd_file;
  this.op_obj=op_obj;
  this.my_idx=my_idx;
  var ds_names=op_obj.getDSNames();
  var ds_idx_list=[];
  for (var i=0; i<ds_names.length; i++) {
    ds_idx_list.push(rrd_file.getDS(ds_names[i]).getIdx());
  }
  this.ds_idx_list=ds_idx_list;
}
RRDDSFilterOp.prototype.getIdx = function() {return this.my_idx;}
RRDDSFilterOp.prototype.getName = function() {return this.op_obj.getName();}

RRDDSFilterOp.prototype.getType = function() {return "function";}
RRDDSFilterOp.prototype.getMin = function() {return undefined;}
RRDDSFilterOp.prototype.getMax = function() {return undefined;}

// These are new to RRDDSFilterOp
RRDDSFilterOp.prototype.getRealDSList = function() { return this.ds_idx_list;}
RRDDSFilterOp.prototype.computeResult = function(val_list) {return this.op_obj.computeResult(val_list);}

// ------ --------------------------------------------
//Private
function RRDRRAFilterOp(rrd_rra,ds_list) {
  this.rrd_rra=rrd_rra;
  this.ds_list=ds_list;
}
RRDRRAFilterOp.prototype.getIdx = function() {return this.rrd_rra.getIdx();}
RRDRRAFilterOp.prototype.getNrRows = function() {return this.rrd_rra.getNrRows();}
RRDRRAFilterOp.prototype.getNrDSs = function() {return this.ds_list.length;}
RRDRRAFilterOp.prototype.getStep = function() {return this.rrd_rra.getStep();}
RRDRRAFilterOp.prototype.getCFName = function() {return this.rrd_rra.getCFName();}
RRDRRAFilterOp.prototype.getEl = function(row_idx,ds_idx) {
  if ((ds_idx>=0) && (ds_idx<this.ds_list.length)) {
    var ds_idx_list=this.ds_list[ds_idx].getRealDSList();
    var val_list=[];
    for (var i=0; i<ds_idx_list.length; i++) {
      val_list.push(this.rrd_rra.getEl(row_idx,ds_idx_list[i]));
    }
    return this.ds_list[ds_idx].computeResult(val_list);
  } else {
    throw RangeError("DS idx ("+ ds_idx +") out of range [0-" + this.ds_list.length +").");
  }	
}
RRDRRAFilterOp.prototype.getElFast = function(row_idx,ds_idx) {
  if ((ds_idx>=0) && (ds_idx<this.ds_list.length)) {
    var ds_idx_list=this.ds_list[ds_idx].getRealDSList();
    var val_list=[];
    for (var i=0; i<ds_idx_list.length; i++) {
      val_list.push(this.rrd_rra.getEl(row_idx,ds_idx_list[i]));
    }
    return this.ds_list[ds_idx].computeResult(val_list);
  } else {
    throw RangeError("DS idx ("+ ds_idx +") out of range [0-" + this.ds_list.length +").");
  }	
}

// --------------------------------------------------
//Public
function RRDFilterOp(rrd_file,op_obj_list) {
  this.rrd_file=rrd_file;
  this.ds_list=[];
  for (i in op_obj_list) {
    var el=op_obj_list[i];
    var outel=null;
    if (typeof(el)=="string") {outel=new RRDFltOpIdent(el);}
    else if (typeof(el)=="number") {outel=new RRDFltOpIdentId(this.rrd_file,el);}
    else {outel=el;}
    this.ds_list.push(new RRDDSFilterOp(rrd_file,outel,i));
  }
}
RRDFilterOp.prototype.getMinStep = function() {return this.rrd_file.getMinStep();}
RRDFilterOp.prototype.getLastUpdate = function() {return this.rrd_file.getLastUpdate();}
RRDFilterOp.prototype.getNrDSs = function() {return this.ds_list.length;}
RRDFilterOp.prototype.getDSNames = function() {
  var ds_names=[];
  for (var i=0; i<this.ds_list.length; i++) {
    ds_names.push(ds_list[i].getName());
  }
  return ds_names;
}
RRDFilterOp.prototype.getDS = function(id) {
  if (typeof id == "number") {
    return this.getDSbyIdx(id);
  } else {
    return this.getDSbyName(id);
  }
}

// INTERNAL: Do not call directly
RRDFilterOp.prototype.getDSbyIdx = function(idx) {
  if ((idx>=0) && (idx<this.ds_list.length)) {
    return this.ds_list[idx];
  } else {
    throw RangeError("DS idx ("+ idx +") out of range [0-" + this.ds_list.length +").");
  }	
}

// INTERNAL: Do not call directly
RRDFilterOp.prototype.getDSbyName = function(name) {
  for (var idx=0; idx<this.ds_list.length; idx++) {
    var ds=this.ds_list[idx];
    var ds_name=ds.getName()
    if (ds_name==name)
      return ds;
  }
  throw RangeError("DS name "+ name +" unknown.");
}

RRDFilterOp.prototype.getNrRRAs = function() {return this.rrd_file.getNrRRAs();}
RRDFilterOp.prototype.getRRAInfo = function(idx) {return this.rrd_file.getRRAInfo(idx);}
RRDFilterOp.prototype.getRRA = function(idx) {return new RRDRRAFilterOp(this.rrd_file.getRRA(idx),this.ds_list);}

// ================================================================
// NOTE: This function is archaic, and will likely be deprecated in future releases
//
// Shift RRAs in rra_list by the integer shift_int (in seconds).
// Only change is getLastUpdate - this takes care of everything.
// Example: To shift the first three 3 RRAs in the file by one hour, 
//         rrd_data = new RRAFilterShift(rra_data, 3600, [0,1,2]);

function RRAFilterShift(rrd_file, shift_int, rra_list) {
  this.rrd_file = rrd_file;
  this.shift_int = shift_int;
  this.rra_list = rra_list;
  this.shift_in_seconds = this.shift_int*3600; //number of steps needed to move 1 hour
}
RRAFilterShift.prototype.getMinStep = function() {return this.rrd_file.getMinStep();}
RRAFilterShift.prototype.getLastUpdate = function() {return this.rrd_file.getLastUpdate()+this.shift_in_seconds;}
RRAFilterShift.prototype.getNrDSs = function() {return this.rrd_file.getNrDSs();}
RRAFilterShift.prototype.getDSNames = function() {return this.rrd_file.getDSNames();}
RRAFilterShift.prototype.getDS = function(id) {return this.rrd_file.getDS(id);}
RRAFilterShift.prototype.getNrRRAs = function() {return this.rra_list.length;}
RRAFilterShift.prototype.getRRAInfo = function(idx) {return this.rrd_file.getRRAInfo(idx);}
RRAFilterShift.prototype.getRRA = function(idx) {return this.rrd_file.getRRA(idx);}

// ================================================================
// Filter RRAs by using a user provided filter object
// The object must implement the following interface
//   getIdx()               - Index of RRA to use
//   getStep()              - new step size (return null to use step size of RRA specified by getIdx() 

// If a number is passed, it implies to just use the RRA as it is
// If an array is passed, it is assumed to be [rra_id,new_step_in_seconds] 
//    and a RRDRRAFltAvgOpNewStep object will be instantiated internally

/* Example classes that implements the interface:
*
*      //This RRA Filter object leaves the original RRA unchanged.
*
*      function RRADoNothing(rra_idx) {
*         this.getIdx = function() {return rra_idx;}
*         this.getStep = function() {return null;} 
*      }
*      
*      // This Filter creates a new RRA with a different step size 
*      // based on another RRA, whose data the new RRA averages. 
*      // rra_idx should be index of RRA with largest step size 
*      // that doesn't exceed new step size.  
*
*      function RRA_Avg(rra_idx,new_step_in_seconds) {
*         this.getIdx = function() {return rra_idx;}
*         this.getStep = function() {return new_step_in_seconds;}
*      }
*      //For example, if you have two RRAs, one with a 5 second step,
*      //and another with a 60 second step, and you'd like a 30 second step,
*      //rrd_data = new RRDRRAFilterAvg(rrd_data,[new RRADoNothing(0), new RRDDoNothing(1),new RRA_Avg(1,30)];)
*/

// Users can use this one directly for simple use cases
// It is equivalent to RRADoNothing and RRA_Avg above
function RRDRRAFltAvgOpNewStep(rra_idx,new_step_in_seconds) {
  this.getIdx = function() {return rra_idx;}
  this.getStep = function() {return new_step_in_seconds;}
}


//Private Function
function RRAInfoFilterAvg(rrd_file, rra, op_obj, idx) {
  this.rrd_file = rrd_file;
  this.op_obj = op_obj;
  this.base_rra = rrd_file.getRRA(this.op_obj.getIdx());
  this.rra = rra;
  this.idx = idx;
  var scaler = 1;
  if (this.op_obj.getStep()!=null) {scaler = this.op_obj.getStep()/this.base_rra.getStep();}
  this.scaler = scaler;
}
RRAInfoFilterAvg.prototype.getIdx = function() {return this.idx;}
RRAInfoFilterAvg.prototype.getNrRows = function() {return this.rra.getNrRows();} //draw info from RRAFilterAvg
RRAInfoFilterAvg.prototype.getStep = function() {return this.rra.getStep();}
RRAInfoFilterAvg.prototype.getCFName = function() {return this.rra.getCFName();}
RRAInfoFilterAvg.prototype.getPdpPerRow = function() {return this.rrd_file.getRRAInfo(this.op_obj.getIdx()).getPdpPerRow()*this.scaler;}

//---------------------------------------------------------------------------
//Private Function
function RRAFilterAvg(rrd_file, op_obj) {
  this.rrd_file = rrd_file;
  this.op_obj = op_obj;
  this.base_rra = rrd_file.getRRA(op_obj.getIdx());
  var scaler=1; 
  if (op_obj.getStep()!=null) {scaler = op_obj.getStep()/this.base_rra.getStep();}
  this.scaler = Math.floor(scaler);
  //document.write(this.scaler+",");
}
RRAFilterAvg.prototype.getIdx = function() {return this.op_obj.getIdx();}
RRAFilterAvg.prototype.getCFName = function() {return this.base_rra.getCFName();}
RRAFilterAvg.prototype.getNrRows = function() {return Math.floor(this.base_rra.getNrRows()/this.scaler);}
RRAFilterAvg.prototype.getNrDSs = function() {return this.base_rra.getNrDSs();}
RRAFilterAvg.prototype.getStep = function() {
   if(this.op_obj.getStep()!=null) {
      return this.op_obj.getStep(); 
   } else { return this.base_rra.getStep();}
}
RRAFilterAvg.prototype.getEl = function(row,ds) {
   var sum=0;
   for(var i=0;i<this.scaler;i++) {
      sum += this.base_rra.getEl((this.scaler*row)+i,ds);
   }
   return sum/this.scaler;
}
RRAFilterAvg.prototype.getElFast = function(row,ds) {
   var sum=0;
   for(var i=0;i<this.scaler;i++) {
      sum += this.base_rra.getElFast((this.scaler*row)+i,ds);
   }
   return sum/this.scaler;
}

//----------------------------------------------------------------------------
//Public function - use this one for RRA averaging
function RRDRRAFilterAvg(rrd_file, op_obj_list) {
  this.rrd_file = rrd_file;
  this.op_obj_list = new Array();
  this.rra_list=[];
  for (var i in op_obj_list) {
    var el=op_obj_list[i];
    var outel=null;
    if (Object.prototype.toString.call(el)=="[object Number]") {outel=new RRDRRAFltAvgOpNewStep(el,null);}
    else if (Object.prototype.toString.call(el)=="[object Array]") {outel=new RRDRRAFltAvgOpNewStep(el[0],el[1]);}
    else {outel=el;}
    this.op_obj_list.push(outel);
    this.rra_list.push(new RRAFilterAvg(rrd_file,outel));
  }
}
RRDRRAFilterAvg.prototype.getMinStep = function() {return this.rrd_file.getMinStep();} //other RRA steps change, not min
RRDRRAFilterAvg.prototype.getLastUpdate = function() {return this.rrd_file.getLastUpdate();}
RRDRRAFilterAvg.prototype.getNrDSs = function() {return this.rrd_file.getNrDSs();} //DSs unchanged
RRDRRAFilterAvg.prototype.getDSNames = function() {return this.rrd_file.getDSNames();}
RRDRRAFilterAvg.prototype.getDS = function(id) {return this.rrd_file.getDS(id);}
RRDRRAFilterAvg.prototype.getNrRRAs = function() {return this.rra_list.length;} 
RRDRRAFilterAvg.prototype.getRRAInfo = function(idx) {
  if ((idx>=0) && (idx<this.rra_list.length)) {
    return new RRAInfoFilterAvg(this.rrd_file, this.rra_list[idx],this.op_obj_list[idx],idx); 
  } else {return this.rrd_file.getRRAInfo(0);}
}
RRDRRAFilterAvg.prototype.getRRA = function(idx) {
  if ((idx>=0) && (idx<this.rra_list.length)) {
    return this.rra_list[idx];
  }
}


/*
 * Combine multiple rrdFiles into one object
 * It implements the same interface, but changing the content
 * 
 * Part of the javascriptRRD package
 * Copyright (c) 2010 Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

// ============================================================
// RRD RRA handling class
function RRDRRASum(rra_list,offset_list,treat_undefined_as_zero) {
  this.rra_list=rra_list;
  this.offset_list=offset_list;
  this.treat_undefined_as_zero=treat_undefined_as_zero;
  this.row_cnt= this.rra_list[0].getNrRows();
}

RRDRRASum.prototype.getIdx = function() {
  return this.rra_list[0].getIdx();
}

// Get number of rows/columns
RRDRRASum.prototype.getNrRows = function() {
  return this.row_cnt;
}
RRDRRASum.prototype.getNrDSs = function() {
  return this.rra_list[0].getNrDSs();
}

// Get RRA step (expressed in seconds)
RRDRRASum.prototype.getStep = function() {
  return this.rra_list[0].getStep();
}

// Get consolidation function name
RRDRRASum.prototype.getCFName = function() {
  return this.rra_list[0].getCFName();
}

RRDRRASum.prototype.getEl = function(row_idx,ds_idx) {
  var outSum=0.0;
  for (var i in this.rra_list) {
    var offset=this.offset_list[i];
    if ((row_idx+offset)<this.row_cnt) {
      var rra=this.rra_list[i];
      val=rra.getEl(row_idx+offset,ds_idx);
    } else {
      /* out of row range -> undefined*/
      val=undefined;
    }
    /* treat all undefines as 0 for now */
    if (val==undefined) {
      if (this.treat_undefined_as_zero) {
	val=0;
      } else {
	/* if even one element is undefined, the whole sum is undefined */
	outSum=undefined;
	break;
      }
    }
    outSum+=val;
  }
  return outSum;
}

// Low precision version of getEl
// Uses getFastDoubleAt
RRDRRASum.prototype.getElFast = function(row_idx,ds_idx) {
  var outSum=0.0;
  for (var i in this.rra_list) {
    var offset=this.offset_list[i];
    if ((row_id+offset)<this.row_cnt) {
      var rra=this.rra_list[i];
      val=rra.getElFast(row_idx+offset,ds_idx);
    } else {
      /* out of row range -> undefined*/
      val=undefined;
    }
    /* treat all undefines as 0 for now */
    if (val==undefined) {
      if (this.treat_undefined_as_zero) {
	val=0;
      } else {
	/* if even one element is undefined, the whole sum is undefined */
	outSum=undefined;
	break;
      }
    }
    outSum+=val;
  }
  return outSum;
}

/*** INTERNAL ** sort by lastupdate, descending ***/

function rrdFileSort(f1, f2) {
  return f2.getLastUpdate()-f1.getLastUpdate();
}

/*
 * Sum several RRDfiles together
 * They must all have the same DSes and the same RRAs
 */ 


/*
 * sumfile_options, if defined, must be an object containing any of these
 *   treat_undefined_as_zero
 *
 */

// For backwards comatibility, if sumfile_options is a boolean,
// it is interpreted like the "old treat_undefined_as_zero" argument

function RRDFileSum(file_list,sumfile_options) {
  if (sumfile_options==undefined) {
    sumfile_options={};
  } else if (typeof(sumfile_options)=="boolean") {
    sumfile_options={treat_undefined_as_zero:sumfile_options};
  }
  this.sumfile_options=sumfile_options;

  
  if (this.sumfile_options.treat_undefined_as_zero==undefined) {
    this.treat_undefined_as_zero=true;
   } else {
    this.treat_undefined_as_zero=this.sumfile_options.treat_undefined_as_zero;
  }
  this.file_list=file_list;
  this.file_list.sort();

  // ===================================
  // Start of user functions

  this.getMinStep = function() {
    return this.file_list[0].getMinStep();
  }
  this.getLastUpdate = function() {
    return this.file_list[0].getLastUpdate();
  }

  this.getNrDSs = function() {
    return this.file_list[0].getNrDSs();
  }

  this.getDSNames = function() {
    return this.file_list[0].getDSNames();
  }

  this.getDS = function(id) {
    return this.file_list[0].getDS(id);
  }

  this.getNrRRAs = function() {
    return this.file_list[0].getNrRRAs();
  }

  this.getRRAInfo = function(idx) {
    return this.file_list[0].getRRAInfo(idx);
  }

  this.getRRA = function(idx) {
    var rra_info=this.getRRAInfo(idx);
    var rra_step=rra_info.getStep();
    var realLastUpdate=undefined;

    var rra_list=new Array();
    var offset_list=new Array();
    for (var i in this.file_list) {
      file=file_list[i];
      fileLastUpdate=file.getLastUpdate();
      if (realLastUpdate!=undefined) {
	fileSkrew=Math.floor((realLastUpdate-fileLastUpdate)/rra_step);
      } else {
	fileSkrew=0;
	firstLastUpdate=fileLastUpdate;
      }
      offset_list.push(fileSkrew);
      fileRRA=file.getRRA(idx);
      rra_list.push(fileRRA);
    }

    return new RRDRRASum(rra_list,offset_list,this.treat_undefined_as_zero);
  }

}
/*
 * Async versions of the rrdFlot class
 * Part of the javascriptRRD package
 * Copyright (c) 2013 Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 * 
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 * Local dependencies:
 *  binaryXHR.js
 *  rrdFile.js and/or rrdMultiFile.js
 *  optionally rrdFilter.js
 *  rrdFlot.js and/or rrdFlotMatrix.js
 *
 * Those modules may have other requirements.
 *
 */


/*
 * customization_callback = function(obj)
 *  This function, if defined, is called after the data has been loaded 
 *    and before the rrdFlot object is instantiated
 *
 *  The object passed as the sole argument is guaranteed to have the following arguments
 *    obj.rrd_data
 *    obj.graph_options
 *    obj.ds_graph_options or obj.rrd_graph_options
 *    obj.rrdflot_defaults
 *    obj.ds_op_list
 *    obj.rra_op_list
 *
 *  The purpose of this callback is to give the caller the option of personalizing
 *    the Flot graph based on the content of the rrd_data
 *    
/* Internal helper function */
function rrdFlotAsyncCallback(bf,obj) {
  var i_rrd_data=undefined;
  if (bf.getLength()<1) {
    alert("File "+obj.url+" is empty (possibly loading failed)!");
    return 1;
  }
  try {
    i_rrd_data=new RRDFile(bf,obj.file_options);
  } catch(err) {
    alert("File "+obj.url+" is not a valid RRD archive!\n"+err);
  }
  if (i_rrd_data!=undefined) {
    if (obj.rrd_data!=null) delete obj.rrd_data;
    obj.rrd_data=i_rrd_data;
    obj.callback();
  }
}

/* Use url==null if you do not know the url yet */
function rrdFlotAsync(html_id, url, 
		      file_options,                                      // see rrdFile.js::RRDFile for documentation
		      graph_options, ds_graph_options, rrdflot_defaults, // see rrdFlot.js::rrdFlot for documentation of these
		      ds_op_list,                                        // if defined, see rrdFilter.js::RRDFilterOp for documentation
		      rra_op_list,                                       // if defined, see rrdFilter.js::RRDRRAFilterAvg for documentation
                      customization_callback                             // if defined, see above
		      ) {
  this.html_id=html_id;
  this.url=url;
  this.file_options=file_options;
  this.graph_options=graph_options;
  this.ds_graph_options=ds_graph_options;
  this.rrdflot_defaults=rrdflot_defaults;
  this.ds_op_list=ds_op_list;
  this.rra_op_list=rra_op_list;

  this.customization_callback=customization_callback;

  this.rrd_flot_obj=null;
  this.rrd_data=null;

  if (url!=null) {
    this.reload(url);
  }
}

rrdFlotAsync.prototype.reload = function(url) {
  this.url=url;
  try {
    FetchBinaryURLAsync(url,rrdFlotAsyncCallback,this);
  } catch (err) {
    alert("Failed loading "+url+"\n"+err);
  }
};

rrdFlotAsync.prototype.callback = function() {
  if (this.rrd_flot_obj!=null) delete this.rrd_flot_obj;

  if (this.customization_callback!=undefined) this.customization_callback(this);

  var irrd_data=this.rrd_data;
  if (this.ds_op_list!=undefined) irrd_data=new RRDFilterOp(irrd_data,this.ds_op_list);
  if (this.rra_op_list!=undefined) irrd_data=new RRDRRAFilterAvg(irrd_data,this.rra_op_list);
  this.rrd_flot_obj=new rrdFlot(this.html_id, irrd_data, this.graph_options, this.ds_graph_options, this.rrdflot_defaults);
};


// ================================================================================================================

/* Internal helper function */
function rrdFlotMultiAsyncCallback(bf,arr) {
  var obj=arr[0];
  var idx=arr[1];

  obj.files_loaded++; // increase this even if it fails later on, else we will never finish

  var i_rrd_data=undefined;
  if (bf.getLength()<1) {
    alert("File "+obj.url_list[idx]+" is empty (possibly loading failed)! You may get a parial result in the graph.");
  } else {
    try {
      i_rrd_data=new RRDFile(bf,obj.file_options);
    } catch(err) {
      alert("File "+obj.url_list[idx]+" is not a valid RRD archive! You may get a partial result in the graph.\n"+err);
    }
  }
  if (i_rrd_data!=undefined) {
    obj.loaded_data[idx]=i_rrd_data;
  }

  if (obj.files_loaded==obj.files_needed) {
    obj.callback();
  }
}

/* Another internal helper function */
function rrdFlotMultiAsyncReload(obj,url_list) {
  obj.files_needed=url_list.length;
  obj.url_list=url_list;
  delete obj.loaded_data;
  obj.loaded_data=[];
  obj.files_loaded=0;
  for (i in url_list) {
    try {
      FetchBinaryURLAsync(url_list[i],rrdFlotMultiAsyncCallback,[obj,i]);
    } catch (err) {
      alert("Failed loading "+url_list[i]+". You may get a partial result in the graph.\n"+err);
      obj.files_needed--;
    }
  }
};



/* Use url_list==null if you do not know the urls yet */
function rrdFlotSumAsync(html_id, url_list,
			 file_options,                                      // see rrdFile.js::RRDFile for documentation
			 sumfile_options,                                   // see rrdMultiFile.js::RRDFileSum for documentation
			 graph_options, ds_graph_options, rrdflot_defaults, // see rrdFlot.js::rrdFlot for documentation of these
			 ds_op_list,                                        // if defined, see rrdFilter.js::RRDFilterOp for documentation
			 rra_op_list,                                       // if defined, see rrdFilter.js::RRDRRAFilterAvg for documentation
			 customization_callback                             // if defined, see above
		      ) {
  this.html_id=html_id;
  this.url_list=url_list;
  this.file_options=file_options;
  this.sumfile_options=sumfile_options;
  this.graph_options=graph_options;
  this.ds_graph_options=ds_graph_options;
  this.rrdflot_defaults=rrdflot_defaults;
  this.ds_op_list=ds_op_list;
  this.rra_op_list=rra_op_list;

  this.customization_callback=customization_callback;

  this.rrd_flot_obj=null;
  this.rrd_data=null; //rrd_data will contain the sum of all the loaded data

  this.loaded_data=null;

  if (url_list!=null) {
    this.reload(url_list);
  }
}

rrdFlotSumAsync.prototype.reload = function(url_list) {rrdFlotMultiAsyncReload(this,url_list);}


rrdFlotSumAsync.prototype.callback = function() {
  if (this.rrd_flot_obj!=null) delete this.rrd_flot_obj;
  var real_data_arr=new Array();
  for (i in this.loaded_data) {
    // account for failed loaded urls
    var el=this.loaded_data[i];
    if (el!=undefined) real_data_arr.push(el);
  }
  var rrd_sum=new RRDFileSum(real_data_arr,this.sumfile_options);
  if (this.rrd_data!=null) delete this.rrd_data;
  this.rrd_data=rrd_sum;

  if (this.customization_callback!=undefined) this.customization_callback(this);

  rrd_sum=this.rrd_data; // customization_callback may have altered it
  if (this.ds_op_list!=undefined) rrd_sum=new RRDFilterOp(rrd_sum,this.ds_op_list);
  if (this.rra_op_list!=undefined) rrd_sum=new RRDRRAFilterAvg(rrd_sum,this.rra_op_list);
  this.rrd_flot_obj=new rrdFlot(this.html_id, rrd_sum, this.graph_options, this.ds_graph_options, this.rrdflot_defaults);
};

// ================================================================================================================

/* Use url_list==null if you do not know the urls yet */
function rrdFlotMatrixAsync(html_id, 
			    url_pair_list,                                     // see rrdFlotMatrix.js::rrdFlotMatrix for documentation
			    file_options,                                      // see rrdFile.js::RRDFile for documentation
			    ds_list,                                           // see rrdFlotMatrix.js::rrdFlotMatrix for documentation
			    graph_options, rrd_graph_options, rrdflot_defaults, // see rrdFlotMatrix.js::rrdFlotMatrix for documentation of these
			    ds_op_list,                                        // if defined, see rrdFilter.js::RRDFilterOp for documentation
			    rra_op_list,                                       // if defined, see rrdFilter.js::RRDRRAFilterAvg for documentation
			    customization_callback                             // if defined, see above
			    ) {
  this.html_id=html_id;
  this.url_pair_list=url_pair_list;
  this.file_options=file_options;
  this.ds_list=ds_list;
  this.graph_options=graph_options;
  this.rrd_graph_options=rrd_graph_options;
  this.rrdflot_defaults=rrdflot_defaults;
  this.ds_op_list=ds_op_list;
  this.rra_op_list=rra_op_list;

  this.customization_callback=customization_callback;

  this.rrd_flot_obj=null;
  this.rrd_data=null; //rrd_data will contain the data of the first url; still useful to explore the DS and RRA structure

  this.loaded_data=null;

  this.url_list=null;
  if (url_pair_list!=null) {
    this.reload(url_pair_list);
  }
}

rrdFlotMatrixAsync.prototype.reload = function(url_pair_list) {
  this.url_pair_list=url_pair_list;
  var url_list=[];
  for (var i in this.url_pair_list) {
    url_list.push(this.url_pair_list[i][1]);
  }

  rrdFlotMultiAsyncReload(this,url_list);
}

rrdFlotMatrixAsync.prototype.callback = function() {
  if (this.rrd_flot_obj!=null) delete this.rrd_flot_obj;

  var real_data_arr=new Array();
  for (var i in this.loaded_data) {
    // account for failed loaded urls
    var el=this.loaded_data[i];
    if (el!=undefined) real_data_arr.push([this.url_pair_list[i][0],el]);
  }
  this.rrd_data=real_data_arr[0];

  if (this.customization_callback!=undefined) this.customization_callback(this);

  for (var i in real_data_arr) {
    if (this.ds_op_list!=undefined) real_data_arr[i]=new RRDFilterOp(real_data_arr[i],this.ds_op_list);
    if (this.rra_op_list!=undefined) real_data_arr[i]=new RRDRRAFilterAvg(real_data_arr[i],this.rra_op_list);
  }
  this.rrd_flot_obj=new rrdFlotMatrix(this.html_id, real_data_arr, this.ds_list, this.graph_options, this.rrd_graph_options, this.rrdflot_defaults);
};

