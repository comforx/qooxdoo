/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A formatter and parser for dates, see
 * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
 *
 * Here is a quick overview of the format pattern keys:
 * <table>
 * <tr><th>Key &nbsp;<th>Description
 * <tr><td><code> G </code><td> era, e.g. "AD" [Not supported yet]
 * <tr><td><code> y </code><td> year
 * <tr><td><code> Y </code><td> year [Not supported yet]
 * <tr><td><code> u </code><td> extended year [Not supported yet]
 * <tr><td><code> Q </code><td> quater [Not supported yet]
 * <tr><td><code> q </code><td> stand-alone quater [Not supported yet]
 * <tr><td><code> M </code><td> month
 * <tr><td><code> L </code><td> stand-alone month [Not supported yet]
 * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
 * <tr><td><code> w </code><td> week of year
 * <tr><td><code> W </code><td> week of month [Not supported yet]
 * <tr><td><code> d </code><td> day of month
 * <tr><td><code> D </code><td> day of year
 * <tr><td><code> F </code><td> day of week in month [Not supported yet]
 * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
 * <tr><td><code> E </code><td> day of week
 * <tr><td><code> e </code><td> local day of week [Not supported yet]
 * <tr><td><code> c </code><td> stand-alone local day of week
 * <tr><td><code> a </code><td> period of day (am or pm)
 * <tr><td><code> h </code><td> 12-hour hour
 * <tr><td><code> H </code><td> 24-hour hour
 * <tr><td><code> K </code><td> hour [0-11]
 * <tr><td><code> k </code><td> hour [1-24]
 * <tr><td><code> j </code><td> special symbol [Not supported yet]
 * <tr><td><code> m </code><td> minute
 * <tr><td><code> s </code><td> second
 * <tr><td><code> S </code><td> fractal second
 * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
 * <tr><td><code> z </code><td> time zone, specific non-location format
 * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
 * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
 * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
 * </table>
 *
 * (This list is preliminary, not all format keys might be implemented). Most
 * keys support repetitions that influence the meaning of the format. Parts of the
 * format string that should not be interpreted as format keys have to be
 * single-quoted.
 *
 * The same format patterns will be used for both parsing and output formatting.
 */
qx.Class.define("qx.util.format.DateFormat",
{
  extend : qx.core.Object,
  implement : qx.util.format.IFormat,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param format {String|null} The format to use. If null, the locale's default
   * format is used.
   * @param locale {String?} optional locale to be used.
   */
  construct : function(format, locale)
  {
    this.base(arguments);

    if (!locale) {
      this.__locale = qx.locale.Manager.getInstance().getLocale();
    } else {
      this.__locale = locale;
    }

    if (format != null) {
      this.__format = format.toString();
    } else {
      this.__format = qx.locale.Date.getDateFormat("long", this.__locale) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.__locale);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns a <code>DateFomat</code> instance that uses the
     * format.
     *
     * @return {String} the date/time instance.
     */
    getDateTimeInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

      if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
        DateFormat._dateTimeInstance = new DateFormat();
      }

      return DateFormat._dateTimeInstance;
    },


    /**
     * Returns a <code>DateFomat</code> instance that uses the format.
     *
     * @return {String} the date instance.
     */
    getDateInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("short") + "";

      if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
        DateFormat._dateInstance = new DateFormat(format);
      }

      return DateFormat._dateInstance;
    },


    /**
     * {Integer} The threshold until when a year should be assumed to belong to the
     * 21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
     * assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
     * used unchanged (e.g. 1792 -> 1792).
     */
    ASSUME_YEAR_2000_THRESHOLD : 30,

    /** {String} The date format used for logging. */
    LOGGING_DATE_TIME__format : "yyyy-MM-dd HH:mm:ss",

    /** {String} The am marker. */
    AM_MARKER : "am",

    /** {String} The pm marker. */
    PM_MARKER : "pm",

    // MEDIUM_TIMEZONE_NAMES and FULL_TIMEZONE_NAMES are taken from:
    // http://www.timeanddate.com/library/abbreviations/timezones/
    /** {String[]} The medium (three letter) timezone names. */
    MEDIUM_TIMEZONE_NAMES : [ 'A',
                                                      'ADT',
                                                      'ADT',
                                                      'AFT',
                                                      'AKDT',
                                                      'AKST',
                                                      'ALMT',
                                                      'AMST',
                                                      'AMST',
                                                      'AMT',
                                                      'AMT',
                                                      'ANAST',
                                                      'ANAT',
                                                      'AQTT',
                                                      'ART',
                                                      'AST',
                                                      'AST',
                                                      'AST',
                                                      'AST',
                                                      'AZOST',
                                                      'AZOT',
                                                      'AZST',
                                                      'AZT',
                                                      'B',
                                                      'BNT',
                                                      'BOT',
                                                      'BRST',
                                                      'BRT',
                                                      'BST',
                                                      'BST',
                                                      'BTT',
                                                      'C',
                                                      'CAST',
                                                      'CAT',
                                                      'CCT',
                                                      'CDT',
                                                      'CDT',
                                                      'CDT',
                                                      'CEST',
                                                      'CET',
                                                      'CET',
                                                      'CHADT',
                                                      'CHAST',
                                                      'CKT',
                                                      'CLST',
                                                      'CLT',
                                                      'COT',
                                                      'CST',
                                                      'CST',
                                                      'CST',
                                                      'CST',
                                                      'CST',
                                                      'CVT',
                                                      'CXT',
                                                      'ChST',
                                                      'D',
                                                      'DAVT',
                                                      'E',
                                                      'EASST',
                                                      'EAST',
                                                      'EAT',
                                                      'EAT',
                                                      'ECT',
                                                      'EDT',
                                                      'EDT',
                                                      'EDT',
                                                      'EDT',
                                                      'EEST',
                                                      'EEST',
                                                      'EEST',
                                                      'EET',
                                                      'EET',
                                                      'EET',
                                                      'EGST',
                                                      'EGT',
                                                      'EST',
                                                      'EST',
                                                      'EST',
                                                      'EST',
                                                      'ET',
                                                      'ET',
                                                      'ET',
                                                      'F',
                                                      'FJST',
                                                      'FJT',
                                                      'FKST',
                                                      'FKT',
                                                      'FNT',
                                                      'G',
                                                      'GALT',
                                                      'GAMT',
                                                      'GET',
                                                      'GFT',
                                                      'GILT',
                                                      'GMT',
                                                      'GMT',
                                                      'GST',
                                                      'GYT',
                                                      'H',
                                                      'HAA',
                                                      'HAA',
                                                      'HAC',
                                                      'HADT',
                                                      'HAE',
                                                      'HAE',
                                                      'HAP',
                                                      'HAR',
                                                      'HAST',
                                                      'HAT',
                                                      'HAY',
                                                      'HKT',
                                                      'HLV',
                                                      'HNA',
                                                      'HNA',
                                                      'HNA',
                                                      'HNC',
                                                      'HNC',
                                                      'HNE',
                                                      'HNE',
                                                      'HNE',
                                                      'HNP',
                                                      'HNR',
                                                      'HNT',
                                                      'HNY',
                                                      'HOVT',
                                                      'I',
                                                      'ICT',
                                                      'IDT',
                                                      'IOT',
                                                      'IRDT',
                                                      'IRKST',
                                                      'IRKT',
                                                      'IRST',
                                                      'IST',
                                                      'IST',
                                                      'IST',
                                                      'JST',
                                                      'K',
                                                      'KGT',
                                                      'KRAST',
                                                      'KRAT',
                                                      'KST',
                                                      'KUYT',
                                                      'L',
                                                      'LHDT',
                                                      'LHST',
                                                      'LINT',
                                                      'M',
                                                      'MAGST',
                                                      'MAGT',
                                                      'MART',
                                                      'MAWT',
                                                      'MDT',
                                                      'MHT',
                                                      'MMT',
                                                      'MSD',
                                                      'MSK',
                                                      'MST',
                                                      'MUT',
                                                      'MVT',
                                                      'MYT',
                                                      'N',
                                                      'NCT',
                                                      'NDT',
                                                      'NFT',
                                                      'NOVST',
                                                      'NOVT',
                                                      'NPT',
                                                      'NST',
                                                      'NUT',
                                                      'NZDT',
                                                      'NZDT',
                                                      'NZST',
                                                      'NZST',
                                                      'O',
                                                      'OMSST',
                                                      'OMST',
                                                      'P',
                                                      'PDT',
                                                      'PET',
                                                      'PETST',
                                                      'PETT',
                                                      'PGT',
                                                      'PHOT',
                                                      'PHT',
                                                      'PKT',
                                                      'PMDT',
                                                      'PMST',
                                                      'PONT',
                                                      'PST',
                                                      'PST',
                                                      'PT',
                                                      'PWT',
                                                      'PYST',
                                                      'PYT',
                                                      'Q',
                                                      'R',
                                                      'RET',
                                                      'S',
                                                      'SAMT',
                                                      'SAST',
                                                      'SBT',
                                                      'SCT',
                                                      'SGT',
                                                      'SRT',
                                                      'SST',
                                                      'T',
                                                      'TAHT',
                                                      'TFT',
                                                      'TJT',
                                                      'TKT',
                                                      'TLT',
                                                      'TMT',
                                                      'TVT',
                                                      'U',
                                                      'ULAT',
                                                      'UYST',
                                                      'UYT',
                                                      'UZT',
                                                      'V',
                                                      'VET',
                                                      'VLAST',
                                                      'VLAT',
                                                      'VUT',
                                                      'W',
                                                      'WAST',
                                                      'WAT',
                                                      'WDT',
                                                      'WEST',
                                                      'WEST',
                                                      'WET',
                                                      'WET',
                                                      'WFT',
                                                      'WGST',
                                                      'WGT',
                                                      'WIB',
                                                      'WIT',
                                                      'WITA',
                                                      'WST',
                                                      'WST',
                                                      'WST',
                                                      'WT',
                                                      'X',
                                                      'Y',
                                                      'YAKST',
                                                      'YAKT',
                                                      'YAPT',
                                                      'YEKST',
                                                      'YEKT',
                                                      'Z'
],

    /** {String[]} The full timezone names. */
    FULL_TIMEZONE_NAMES : [  "Alpha Time Zone Military",
                                                  "Atlantic Daylight Time Atlantic",
                                                  "Atlantic Daylight Time North America",
                                                  "Afghanistan Time Asia",
                                                  "Alaska Daylight Time North America",
                                                  "Alaska Standard Time North America",
                                                  "Alma-Ata Time Asia",
                                                  "Armenia Summer Time Asia",
                                                  "Amazon Summer Time South America",
                                                  "Armenia Time Asia",
                                                  "Amazon Time South America",
                                                  "Anadyr Summer Time Asia",
                                                  "Anadyr Time Asia",
                                                  "Aqtobe Time Asia",
                                                  "Argentina Time South America",
                                                  "Arabia Standard Time Asia",
                                                  "Atlantic Standard Time Atlantic",
                                                  "Atlantic Standard Time Caribbean",
                                                  "Atlantic Standard Time North America",
                                                  "Azores Summer Time Atlantic",
                                                  "Azores Time Atlantic",
                                                  "Azerbaijan Summer Time Asia",
                                                  "Azerbaijan Time Asia",
                                                  "Bravo Time Zone Military",
                                                  "Brunei Darussalam Time Asia",
                                                  "Bolivia Time South America",
                                                  "Brasilia Summer Time South America",
                                                  "Brasília time South America",
                                                  "Bangladesh Standard Time Asia",
                                                  "British Summer Time Europe",
                                                  "Bhutan Time Asia",
                                                  "Charlie Time Zone Military",
                                                  "Casey Time Antarctica",
                                                  "Central Africa Time Africa",
                                                  "Cocos Islands Time Indian Ocean",
                                                  "Central Daylight Time Australia",
                                                  "Cuba Daylight Time Caribbean",
                                                  "Central Daylight Time North America",
                                                  "Central European Summer Time Europe",
                                                  "Central European Time Africa",
                                                  "Central European Time Europe",
                                                  "Chatham Island Daylight Time Pacific",
                                                  "Chatham Island Standard Time Pacific",
                                                  "Cook Island Time Pacific",
                                                  "Chile Summer Time South America",
                                                  "Chile Standard Time South America",
                                                  "Colombia Time South America",
                                                  "China Standard Time Asia",
                                                  "Central Standard Time Australia",
                                                  "Central Standard Time Central America",
                                                  "Cuba Standard Time Caribbean",
                                                  "Central Standard Time North America",
                                                  "Cape Verde Time Africa",
                                                  "Christmas Island Time Australia",
                                                  "Chamorro Standard Time Pacific",
                                                  "Delta Time Zone Military",
                                                  "Davis Time Antarctica",
                                                  "Echo Time Zone Military",
                                                  "Easter Island Summer Time Pacific",
                                                  "Easter Island Standard Time Pacific",
                                                  "Eastern Africa Time Africa",
                                                  "East Africa Time Indian Ocean",
                                                  "Ecuador Time South America",
                                                  "Eastern Daylight Time Australia",
                                                  "Eastern Daylight Time Caribbean",
                                                  "Eastern Daylight Time North America",
                                                  "Eastern Daylight Time Pacific",
                                                  "Eastern European Summer Time Africa",
                                                  "Eastern European Summer Time Asia",
                                                  "Eastern European Summer Time Europe",
                                                  "Eastern European Time Africa",
                                                  "Eastern European Time Asia",
                                                  "Eastern European Time Europe",
                                                  "Eastern Greenland Summer Time North America",
                                                  "East Greenland Time North America",
                                                  "Eastern Standard Time Australia",
                                                  "Eastern Standard Time Central America",
                                                  "Eastern Standard Time Caribbean",
                                                  "Eastern Standard Time North America",
                                                  "Tiempo del Este Central America",
                                                  "Tiempo del Este Caribbean",
                                                  "Tiempo Del Este  North America",
                                                  "Foxtrot Time Zone Military",
                                                  "Fiji Summer Time Pacific",
                                                  "Fiji Time Pacific",
                                                  "Falkland Islands Summer Time South America",
                                                  "Falkland Island Time South America",
                                                  "Fernando de Noronha Time South America",
                                                  "Golf Time Zone Military",
                                                  "Galapagos Time Pacific",
                                                  "Gambier Time Pacific",
                                                  "Georgia Standard Time Asia",
                                                  "French Guiana Time South America",
                                                  "Gilbert Island Time Pacific",
                                                  "Greenwich Mean Time Africa",
                                                  "Greenwich Mean Time Europe",
                                                  "Gulf Standard Time Asia",
                                                  "Guyana Time South America",
                                                  "Hotel Time Zone Military",
                                                  "Heure Avancée de l'Atlantique Atlantic",
                                                  "Heure Avancée de l'Atlantique North America",
                                                  "Heure Avancée du Centre North America",
                                                  "Hawaii-Aleutian Daylight Time North America",
                                                  "Heure Avancée de l'Est  Caribbean",
                                                  "Heure Avancée de l'Est  North America",
                                                  "Heure Avancée du Pacifique North America",
                                                  "Heure Avancée des Rocheuses North America",
                                                  "Hawaii-Aleutian Standard Time North America",
                                                  "Heure Avancée de Terre-Neuve North America",
                                                  "Heure Avancée du Yukon North America",
                                                  "Hong Kong Time Asia",
                                                  "Hora Legal de Venezuela South America",
                                                  "Heure Normale de l'Atlantique Atlantic",
                                                  "Heure Normale de l'Atlantique Caribbean",
                                                  "Heure Normale de l'Atlantique North America",
                                                  "Heure Normale du Centre Central America",
                                                  "Heure Normale du Centre North America",
                                                  "Heure Normale de l'Est Central America",
                                                  "Heure Normale de l'Est Caribbean",
                                                  "Heure Normale de l'Est North America",
                                                  "Heure Normale du Pacifique North America",
                                                  "Heure Normale des Rocheuses North America",
                                                  "Heure Normale de Terre-Neuve North America",
                                                  "Heure Normale du Yukon North America",
                                                  "Hovd Time Asia",
                                                  "India Time Zone Military",
                                                  "Indochina Time Asia",
                                                  "Israel Daylight Time Asia",
                                                  "Indian Chagos Time Indian Ocean",
                                                  "Iran Daylight Time Asia",
                                                  "Irkutsk Summer Time Asia",
                                                  "Irkutsk Time Asia",
                                                  "Iran Standard Time Asia",
                                                  "Israel Standard Time Asia",
                                                  "India Standard Time Asia",
                                                  "Irish Standard Time Europe",
                                                  "Japan Standard Time Asia",
                                                  "Kilo Time Zone Military",
                                                  "Kyrgyzstan Time Asia",
                                                  "Krasnoyarsk Summer Time Asia",
                                                  "Krasnoyarsk Time Asia",
                                                  "Korea Standard Time Asia",
                                                  "Kuybyshev Time Europe",
                                                  "Lima Time Zone Military",
                                                  "Lord Howe Daylight Time Australia",
                                                  "Lord Howe Standard Time Australia",
                                                  "Line Islands Time Pacific",
                                                  "Mike Time Zone Military",
                                                  "Magadan Summer Time Asia",
                                                  "Magadan Time Asia",
                                                  "Marquesas Time Pacific",
                                                  "Mawson Time Antarctica",
                                                  "Mountain Daylight Time North America",
                                                  "Marshall Islands Time Pacific",
                                                  "Myanmar Time Asia",
                                                  "Moscow Daylight Time Europe",
                                                  "Moscow Standard Time Europe",
                                                  "Mountain Standard Time North America",
                                                  "Mauritius Time Africa",
                                                  "Maldives Time Asia",
                                                  "Malaysia Time Asia",
                                                  "November Time Zone Military",
                                                  "New Caledonia Time Pacific",
                                                  "Newfoundland Daylight Time North America",
                                                  "Norfolk Time Australia",
                                                  "Novosibirsk Summer Time Asia",
                                                  "Novosibirsk Time Asia",
                                                  "Nepal Time  Asia",
                                                  "Newfoundland Standard Time North America",
                                                  "Niue Time Pacific",
                                                  "New Zealand Daylight Time Antarctica",
                                                  "New Zealand Daylight Time Pacific",
                                                  "New Zealand Standard Time Antarctica",
                                                  "New Zealand Standard Time Pacific",
                                                  "Oscar Time Zone Military",
                                                  "Omsk Summer Time Asia",
                                                  "Omsk Standard Time Asia",
                                                  "Papa Time Zone Military",
                                                  "Pacific Daylight Time North America",
                                                  "Peru Time South America",
                                                  "Kamchatka Summer Time Asia",
                                                  "Kamchatka Time Asia",
                                                  "Papua New Guinea Time Pacific",
                                                  "Phoenix Island Time Pacific",
                                                  "Philippine Time Asia",
                                                  "Pakistan Standard Time Asia",
                                                  "Pierre & Miquelon Daylight Time North America",
                                                  "Pierre & Miquelon Standard Time North America",
                                                  "Pohnpei Standard Time Pacific",
                                                  "Pacific Standard Time North America",
                                                  "Pitcairn Standard Time Pacific",
                                                  "Tiempo del Pacífico North America",
                                                  "Palau Time Pacific",
                                                  "Paraguay Summer Time South America",
                                                  "Paraguay Time South America",
                                                  "Quebec Time Zone Military",
                                                  "Romeo Time Zone Military",
                                                  "Reunion Time Africa",
                                                  "Sierra Time Zone Military",
                                                  "Samara Time Europe",
                                                  "South Africa Standard Time Africa",
                                                  "Solomon IslandsTime Pacific",
                                                  "Seychelles Time Africa",
                                                  "Singapore Time Asia",
                                                  "Suriname Time South America",
                                                  "Samoa Standard Time Pacific",
                                                  "Tango Time Zone Military",
                                                  "Tahiti Time Pacific",
                                                  "French Southern and Antarctic Time Indian Ocean",
                                                  "Tajikistan Time Asia",
                                                  "Tokelau Time Pacific",
                                                  "East Timor Time Asia",
                                                  "Turkmenistan Time Asia",
                                                  "Tuvalu Time Pacific",
                                                  "Uniform Time Zone Military",
                                                  "Ulaanbaatar Time Asia",
                                                  "Uruguay Summer Time South America",
                                                  "Uruguay Time South America",
                                                  "Uzbekistan Time Asia",
                                                  "Victor Time Zone Military",
                                                  "Venezuelan Standard Time South America",
                                                  "Vladivostok Summer Time Asia",
                                                  "Vladivostok Time Asia",
                                                  "Vanuatu Time Pacific",
                                                  "Whiskey Time Zone Military",
                                                  "West Africa Summer Time Africa",
                                                  "West Africa Time Africa",
                                                  "Western Daylight Time Australia",
                                                  "Western European Summer Time Africa",
                                                  "Western European Summer Time Europe",
                                                  "Western European Time Africa",
                                                  "Western European Time Europe",
                                                  "Wallis and Futuna Time Pacific",
                                                  "Western Greenland Summer Time North America",
                                                  "West Greenland Time North America",
                                                  "Western Indonesian Time Asia",
                                                  "Eastern Indonesian Time Asia",
                                                  "Central Indonesian Time Asia",
                                                  "Western Sahara Summer Time Africa",
                                                  "Western Standard Time Australia",
                                                  "West Samoa Time Pacific",
                                                  "Western Sahara Standard Time Africa",
                                                  "X-ray Time Zone Military",
                                                  "Yankee Time Zone Military",
                                                  "Yakutsk Summer Time Asia",
                                                  "Yakutsk Time Asia",
                                                  "Yap Time Pacific",
                                                  "Yekaterinburg Summer Time Asia",
                                                  "Yekaterinburg Time Asia",
                                                  "Zulu Time Zone"
    ]
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __locale : null,
    __format : null,
    __parseFeed : null,
    __parseRules : null,
    __formatTree : null,

    /**
     * Fills a number with leading zeros ("25" -> "0025").
     *
     * @param number {Integer} the number to fill.
     * @param minSize {Integer} the minimum size the returned string should have.
     * @return {String} the filled number as string.
     */
    __fillNumber : function(number, minSize)
    {
      var str = "" + number;

      while (str.length < minSize) {
        str = "0" + str;
      }

      return str;
    },


    /**
     * Returns the day in year of a date.
     *
     * @param date {Date} the date.
     * @return {Integer} the day in year.
     */
    __getDayInYear : function(date)
    {
      var helpDate = new Date(date.getTime());
      var day = helpDate.getDate();

      while (helpDate.getMonth() != 0)
      {
        // Set the date to the last day of the previous month
        helpDate.setDate(-1);
        day += helpDate.getDate() + 1;
      }

      return day;
    },


    /**
     * Returns the thursday in the same week as the date.
     *
     * @param date {Date} the date to get the thursday of.
     * @return {Date} the thursday in the same week as the date.
     */
    __thursdayOfSameWeek : function(date) {
      return new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
    },


    /**
     * Returns the week in year of a date.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week in year.
     */
    __getWeekInYear : function(date)
    {
      // This algorithm gets the correct calendar week after ISO 8601.
      // This standard is used in almost all european countries.
      // TODO: In the US week in year is calculated different!
      // See http://www.merlyn.demon.co.uk/weekinfo.htm
      // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
      // Get the thursday of the week the date belongs to
      var thursdayDate = this.__thursdayOfSameWeek(date);

      // Get the year the thursday (and therefore the week) belongs to
      var weekYear = thursdayDate.getFullYear();

      // Get the thursday of the week january 4th belongs to
      // (which defines week 1 of a year)
      var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(weekYear, 0, 4));

      // Calculate the calendar week
      return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
    },


    /**
     * Formats a date.
     *
     * @param date {Date} The date to format.
     * @return {String} the formatted date.
     */
    format : function(date)
    {
      // check for null dates
      if (date == null) {
        return null;
      }

      var DateFormat = qx.util.format.DateFormat;
      var locale = this.__locale;

      var fullYear = date.getFullYear();
      var month = date.getMonth();
      var dayOfMonth = date.getDate();
      var dayOfWeek = date.getDay();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var ms = date.getMilliseconds();

      var timezoneOffset = date.getTimezoneOffset();
      var timezoneSign = timezoneOffset > 0 ? 1 : -1;
      var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
      var timezoneMinutes = Math.abs(timezoneOffset) % 60;
      var timezoneName = (''+date).replace(/^[^\(]+/,'').replace('(','').replace(')','');

      // Create the output
      this.__initFormatTree();
      var output = "";

      for (var i=0; i<this.__formatTree.length; i++)
      {
        var currAtom = this.__formatTree[i];

        if (currAtom.type == "literal") {
          output += currAtom.text;
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get its replacement
          var replacement = "?";

          switch(wildcardChar)
          {
              // TODO: G - Era designator (e.g. AD). Problem: Not covered by JScript Date class
              // TODO: W - Week in month (e.g. 2)
              // TODO: F - Day of week in month (e.g.   2). Problem: What is this?
            case 'y': // Year
              if (wildcardSize == 2) {
                replacement = this.__fillNumber(fullYear % 100, 2);
              } else {
                replacement = fullYear + "";
                if (wildcardSize > replacement.length) {
                  for (var j = replacement.length; j < wildcardSize; j++) {
                    replacement = "0" + replacement;
                  };
                }
              }

              break;

            case 'D': // Day in year (e.g. 189)
              replacement = this.__fillNumber(this.__getDayInYear(date), wildcardSize);
              break;

            case 'd': // Day in month
              replacement = this.__fillNumber(dayOfMonth, wildcardSize);
              break;

            case 'w': // Week in year (e.g. 27)
              replacement = this.__getWeekInYear(date);
              break;

            case 'E': // Day in week
              if (wildcardSize == 2) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone");
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format");
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format");
              }

              break;

            case 'c': // Stand-alone local day in week
              if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone");
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone");
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone");
              } else if (wildcardSize == 1) {
                replacement = ''+dayOfWeek;
              }

              break;

            case 'M': // Month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format");
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "format");
              }

              break;

            case 'L': // Stand-alone month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone");
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone");
              }

              break;

            case 'a': // am/pm marker
              // NOTE: 0:00 is am, 12:00 is pm
              replacement = (hours < 12) ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
              break;

            case 'H': // Hour in day (0-23)
              replacement = this.__fillNumber(hours, wildcardSize);
              break;

            case 'k': // Hour in day (1-24)
              replacement = this.__fillNumber((hours == 0) ? 24 : hours, wildcardSize);
              break;

            case 'K': // Hour in am/pm (0-11)
              replacement = this.__fillNumber(hours % 12, wildcardSize);
              break;

            case 'h': // Hour in am/pm (1-12)
              replacement = this.__fillNumber(((hours % 12) == 0) ? 12 : (hours % 12), wildcardSize);
              break;

            case 'm': // Minute in hour
              replacement = this.__fillNumber(minutes, wildcardSize);
              break;

            case 's': // Second in minute
              replacement = this.__fillNumber(seconds, wildcardSize);
              break;

            case 'S': // Millisecond
              replacement = this.__fillNumber(ms, wildcardSize);
              break;

            case 'z': // Time zone
              if (wildcardSize >= 1 && wildcardSize <= 3)
              {
                replacement = timezoneName;
                if(!replacement || replacement.length<1)
                {
                  replacement =
                  "GMT" +
                  ((timezoneSign > 0) ? "-" : "+") +
                  this.__fillNumber(Math.abs(timezoneHours)) +
                  ":" + this.__fillNumber(timezoneMinutes, 2);
                }
              }
              else if (wildcardSize == 4)
              {
                var key = timezoneHours;
                if(!timezoneName || timezoneName.length<1) {
                var key = 
                replacement = DateFormat.FULL_TIMEZONE_NAMES[timezoneHours];
              }
              }

              break;

            case 'Z': // RFC 822 time zone
              replacement =
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                this.__fillNumber(timezoneMinutes, 2);
              break;
          }

          output += replacement;
        }
      }

      return output;
    },


    /**
     * Parses a date.
     *
     * @param dateStr {String} the date to parse.
     * @return {Date} the parsed date.
     * @throws {Error} If the format is not well formed or if the date string does not
     *       match to the format.
     */
    parse : function(dateStr)
    {
      this.__initParseFeed();

      // Apply the regex
      var hit = this.__parseFeed.regex.exec(dateStr);

      if (hit == null) {
        throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format);
      }

      // Apply the rules
      var dateValues =
      {
        year  : 1970,
        month : 0,
        day   : 1,
        hour  : 0,
        ispm  : false,
        min   : 0,
        sec   : 0,
        ms    : 0
      };

      var currGroup = 1;

      for (var i=0; i<this.__parseFeed.usedRules.length; i++)
      {
        var rule = this.__parseFeed.usedRules[i];

        var value = hit[currGroup];

        if (rule.field != null) {
          dateValues[rule.field] = parseInt(value, 10);
        } else {
          rule.manipulator(dateValues, value);
        }

        currGroup += (rule.groups == null) ? 1 : rule.groups;
      }

      var date = new Date(dateValues.year, dateValues.month, dateValues.day, (dateValues.ispm) ? (dateValues.hour + 12) : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

      if (dateValues.month != date.getMonth() || dateValues.year != date.getFullYear())
      {
        // TODO: check if this is also necessary for the time components
        throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
      }

      return date;
    },


    /**
     * Helper method for {@link #format()} and {@link #parse()}.
     * Parses the date format.
     *
     * @return {void}
     */
    __initFormatTree : function()
    {
      if (this.__formatTree != null) {
        return;
      }

      this.__formatTree = [];

      var currWildcardChar;
      var currWildcardSize = 0;
      var currLiteral = "";
      var format = this.__format;

      var state = "default";

      var i = 0;

      while (i < format.length)
      {
        var currChar = format.charAt(i);

        switch(state)
        {
          case "quoted_literal":
            // We are now inside a quoted literal
            // Check whether the current character is an escaped "'" character
            if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {

                // this is the last character
                i++;

                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }
              else
              {

                // quoted literal ends
                i++;

                state = "unkown";
              }
            }
            else
            {
              currLiteral += currChar;
              i++;
            }

            break;

          case "wildcard":
            // Check whether the currChar belongs to that wildcard
            if (currChar == currWildcardChar)
            {
              // It does -> Raise the size
              currWildcardSize++;

              i++;
            }
            else
            {
              // It does not -> The current wildcard is done
              this.__formatTree.push(
              {
                type      : "wildcard",
                character : currWildcardChar,
                size      : currWildcardSize
              });

              currWildcardChar = null;
              currWildcardSize = 0;
              state = "default";
            }

            break;

          default:
            // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
            if ((currChar >= 'a' && currChar <= 'z') || (currChar >= 'A' && currChar <= 'Z'))
            {
              // This is a letter -> All letters are wildcards
              // Start a new wildcard
              currWildcardChar = currChar;
              state = "wildcard";
            }
            else if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {
                // this is the last character
                currLiteral += currChar;
                i++;
                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }

              i++;
              state = "quoted_literal";
            }
            else
            {
              state = "default";
            }

            if (state != "default")
            {
              // Add the literal
              if (currLiteral.length > 0)
              {
                this.__formatTree.push(
                {
                  type : "literal",
                  text : currLiteral
                });

                currLiteral = "";
              }
            }
            else
            {
              // This is an unquoted literal -> Add it to the current literal
              currLiteral += currChar;
              i++;
            }

            break;
        }
      }

      // Add the last wildcard or literal
      if (currWildcardChar != null)
      {
        this.__formatTree.push(
        {
          type      : "wildcard",
          character : currWildcardChar,
          size      : currWildcardSize
        });
      }
      else if (currLiteral.length > 0)
      {
        this.__formatTree.push(
        {
          type : "literal",
          text : currLiteral
        });
      }
    },


    /**
     * Initializes the parse feed.
     *
     * The parse contains everything needed for parsing: The regular expression
     * (in compiled and uncompiled form) and the used rules.
     *
     * @return {Map} the parse feed.
     * @throws {Error} If the date format is malformed.
     */
    __initParseFeed : function()
    {
      if (this.__parseFeed != null)
      {
        // We already have the parse feed
        return ;
      }

      var format = this.__format;

      // Initialize the rules
      this.__initParseRules();
      this.__initFormatTree();

      // Get the used rules and construct the regex pattern
      var usedRules = [];
      var pattern = "^";

      for (var atomIdx=0; atomIdx<this.__formatTree.length; atomIdx++)
      {
        var currAtom = this.__formatTree[atomIdx];

        if (currAtom.type == "literal") {
          pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get the rule for this wildcard
          var wildcardRule;

          for (var ruleIdx=0; ruleIdx<this.__parseRules.length; ruleIdx++)
          {
            var rule = this.__parseRules[ruleIdx];

            if ( this.__isRuleForWildcard(rule,wildcardChar,wildcardSize))
            {
              // We found the right rule for the wildcard
              wildcardRule = rule;
              break;
            }
          }

          // Check the rule
          if (wildcardRule == null)
          {
            // We have no rule for that wildcard -> Malformed date format
            var wildcardStr = "";

            for (var i=0; i<wildcardSize; i++) {
              wildcardStr += wildcardChar;
            }

            throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
          }
          else
          {
            // Add the rule to the pattern
            usedRules.push(wildcardRule);
            pattern += wildcardRule.regex;
          }
        }
      }

      pattern += "$";

      // Create the regex
      var regex;

      try {
        regex = new RegExp(pattern);
      } catch(exc) {
        throw new Error("Malformed date format: " + format);
      }

      // Create the this.__parseFeed
      this.__parseFeed =
      {
        regex       : regex,
        "usedRules" : usedRules,
        pattern     : pattern
      };
    },

    /**
     * Checks wether the rule matches the wildcard or not.
     * @param rule {Object} the rule we try to match with the wildcard
     * @param wildcardChar {String} the character in the wildcard
     * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
     * @return {Boolean} if the rule matches or not
     */
    __isRuleForWildcard : function(rule, wildcardChar, wildcardSize)
    {
      if(wildcardChar==='y' && rule.pattern==='y+')
      {
        rule.regex = rule.regexFunc(wildcardSize);
        return true;
      }
      else
      {
        return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
      }
    },
    /**
     * Initializes the static parse rules.
     *
     * @return {void}
     */
    __initParseRules : function()
    {
      var DateFormat = qx.util.format.DateFormat;
      var LString = qx.lang.String;

      if (this.__parseRules != null)
      {
        // The parse rules are already initialized
        return ;
      }

      var rules = this.__parseRules = [];

      var amMarker = qx.locale.Date.getAmMarker(this.__locale).toString() || DateFormat.AM_MARKER;
      var pmMarker = qx.locale.Date.getPmMarker(this.__locale).toString() || DateFormat.PM_MARKER;

      var yearManipulator = function(dateValues, value)
      {
        value = parseInt(value, 10);

        if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
          value += 2000;
        } else if (value < 100) {
          value += 1900;
        }

        dateValues.year = value;
      };

      var monthManipulator = function(dateValues, value) {
        dateValues.month = parseInt(value, 10) - 1;
      };

      var ampmManipulator = function(dateValues, value) {
        var pmMarker = qx.locale.Date.getPmMarker(this.__locale).toString() || DateFormat.PM_MARKER;
        dateValues.ispm = (value == pmMarker);
      };

      var noZeroHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 24;
      };

      var noZeroAmPmHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 12;
      };

      var ignoreManipulator = function(dateValues, value) {
        return;
      };

      var shortMonthNames = qx.locale.Date.getMonthNames("abbreviated", this.__locale, "format");
      for (var i=0; i<shortMonthNames.length; i++) {
        shortMonthNames[i] = LString.escapeRegexpChars(shortMonthNames[i].toString());
      }

      var shortMonthNamesManipulator = function(dateValues, value) {
        value = LString.escapeRegexpChars(value);
        dateValues.month = shortMonthNames.indexOf(value);
      }

      var fullMonthNames = qx.locale.Date.getMonthNames("wide", this.__locale, "format");
      for (var i=0; i<fullMonthNames.length; i++) {
        fullMonthNames[i] = LString.escapeRegexpChars(fullMonthNames[i].toString());
      }

      var fullMonthNamesManipulator = function(dateValues, value) {
        value = LString.escapeRegexpChars(value);
        dateValues.month = fullMonthNames.indexOf(value);
      }

      var narrowDayNames = qx.locale.Date.getDayNames("narrow", this.__locale, "stand-alone");
      for (var i=0; i<narrowDayNames.length; i++) {
        narrowDayNames[i] = LString.escapeRegexpChars(narrowDayNames[i].toString());
      }

      var narrowDayNamesManipulator = function(dateValues, value) {
        value = LString.escapeRegexpChars(value);
        dateValues.month = narrowDayNames.indexOf(value);
      }

      var abbrDayNames = qx.locale.Date.getDayNames("abbreviated", this.__locale, "format");
      for (var i=0; i<abbrDayNames.length; i++) {
        abbrDayNames[i] = LString.escapeRegexpChars(abbrDayNames[i].toString());
      }

      var abbrDayNamesManipulator = function(dateValues, value) {
        value = LString.escapeRegexpChars(value);
        dateValues.month = abbrDayNames.indexOf(value);
      }

      var fullDayNames = qx.locale.Date.getDayNames("wide", this.__locale, "format");
      for (var i=0; i<fullDayNames.length; i++) {
        fullDayNames[i] = LString.escapeRegexpChars(fullDayNames[i].toString());
      }

      var fullDayNamesManipulator = function(dateValues, value) {
        value = LString.escapeRegexpChars(value);
        dateValues.month = fullDayNames.indexOf(value);
      }

      // Unsupported: w (Week in year), W (Week in month), D (Day in year),
      // F (Day of week in month)

      rules.push(
      {
        pattern     : "y+",
        regexFunc       : function(yNumber)
          {
            var regex = "(";
            for(var i=0;i<yNumber;i++)
            {
              regex += "\\d";
              if(i===yNumber-1 && i!==1) {
                regex += "+?";
              }
            }
            regex += ")";
            return regex;
          },
        manipulator : yearManipulator
      });

      rules.push(
      {
        pattern     : "M",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MM",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MMM",
        regex       : "(" + shortMonthNames.join("|") + ")",
        manipulator : shortMonthNamesManipulator
      });

      rules.push(
      {
        pattern     : "MMMM",
        regex       : "(" + fullMonthNames.join("|") + ")",
        manipulator : fullMonthNamesManipulator
      });

      rules.push(
      {
        pattern : "dd",
        regex   : "(\\d\\d?)",
        field   : "day"
      });

      rules.push(
      {
        pattern : "d",
        regex   : "(\\d\\d?)",
        field   : "day"
      });

      rules.push(
      {
        pattern     : "EE",
        regex       : "(" + narrowDayNames.join("|") + ")",
        manipulator : narrowDayNamesManipulator
      });

      rules.push(
      {
        pattern     : "EEE",
        regex       : "(" + abbrDayNames.join("|") + ")",
        manipulator : abbrDayNamesManipulator
      });

      rules.push(
      {
        pattern     : "EEEE",
        regex       : "(" + fullDayNames.join("|") + ")",
        manipulator : fullDayNamesManipulator
      });

      rules.push(
      {
        pattern     : "a",
        regex       : "(" + amMarker + "|" + pmMarker + ")",
        manipulator : ampmManipulator
      });

      rules.push(
      {
        pattern : "HH",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "H",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "kk",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern     : "k",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern : "KK",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "K",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "hh",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern     : "h",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern : "mm",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "m",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "ss",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "s",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "SSS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "SS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "S",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern     : "Z",
        regex       : "([\\+\\-]\\d\\d:?\\d\\d)",
        manipulator : ignoreManipulator
      });

      rules.push(
      {
        pattern     : "z",
        regex       : "([a-zA-Z]+)",
        manipulator : ignoreManipulator
      });
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__formatTree = this.__parseFeed = this.__parseRules = null;
  }
});