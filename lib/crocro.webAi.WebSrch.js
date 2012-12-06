/*	Web AI <http://crocro.com/write/web_ai/wiki.cgi>
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
	in a Japanese translation <http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license>
	Copyright (c) 2010 Masakazu Yanai / (c) 2010 Cronus Crown <webmaster@crocro.com>
*/

	// crocro.webAiの初期化
	if (! crocro) var crocro = {};
	if (! crocro.webAi) crocro.webAi = {};

	/**
	 *	@variable	crocro.webAi.WebSrch()
	 *	@title	検索用オブジェクト
	 *	@description
	 *
	 *		検索用オブジェクト。
	 *		主に、「Google AJAX Search API」を使いやすくすることを目的としている。
	 *		メソッド・チェーンで、初期化や検索、その結果の処理などを記述できる。
	 *		newで初期化してから利用する。
	 *
	 *		「reset」メソッドで予約をクリアして、
	 *		各種メソッドで予約の登録を行った後、
	 *		「start」メソッドで、予約した処理を順番に実行していく。
	 *
	 *		「start」を呼び出すまでは実行は行われないので、
	 *		ユーザーの操作をいくつか受け付けた後に、
	 *		実行ボタンで処理を開始するようなことも可能。
	 *
	 *		例）<br>
	 *		var g = new crocro.webAi.WebSrch();<br>
	 *		g<br>
	 *		.reset()		// 予約のクリア<br>
	 *		.hoge()			// 命令の追加<br>
	 *		.hoge()			// 命令の追加<br>
	 *		.hoge()			// 命令の追加<br>
	 *		.start();		// 追加した命令を実行
	 *
	 *		実際の用法は、サンプルコードを参照。
	 */
	crocro.webAi.WebSrch = function() {
		// 内部パラメータ
		/**
		 *	@variable	WebSrch.srchPrms
		 *	@title	検索オブジェクト
		 *	@description
		 *		「web: {obj: null, init: function() {return new google.search.WebSearch();}}」
		 *		の形式の配列。この場合、「WebSrch.init」メソッドで「web」を指定すると、
		 *		「web.obj」に「web.init()」の戻り値が登録される。
		 *
		 *		デフォルトで「web」「img」「nws」「blg」が設定されている。
		 *		配列にオブジェクトを追加することで、他の検索も利用することができる。
		 *
		 *		詳しくはソースコードを参照。
		 */
		this.srchPrms = {
			 web: {obj: null, init: function() {return new google.search.WebSearch();}}
			,img: {obj: null, init: function() {return new google.search.ImageSearch();}}
			,nws: {obj: null, init: function() {return new google.search.NewsSearch();}}
			,blg: {obj: null, init: function() {return new google.search.BlogSearch();}}
		};

		// 自分自身
		var self = this;

		/**
		 *	@variable	WebSrch.isExec
		 *	@title	実行中か否か
		 *	@description
		 *		命令が実行中の間は「true」が格納されている。
		 *		二重起動防止などの判定用に利用する。
		 *
		 *		詳しくはサンプルのソースコードを参照。
		 */
		this.isExec = false;

		// インターバル
		/**
		 *	@variable	WebSrch.intrvl
		 *	@title	インターバル
		 *	@description
		 *		処理の実行インターバル。
		 *		数値か、数値を戻す関数を設定する。
		 *
		 *		通信の負荷を軽減するために、1秒に一度実行を行うなどの用途で利用する。
		 *
		 *		デフォルトは「0」。
		 */
		this.intrvl = 0;	// 処理の実行インターバル（数値か、数値を戻す関数）

		// 未初期化時の自動初期化処理（無限ループ対策）
		var autoJSInit = false;			// 外部JavaScript
		var autoSrcherInit = false;		// Searcherオブジェクト

		// Google AJAX APIのURL
		var urlGglJSApi = "https://www.google.com/jsapi";

		// jQueryのURL
		var urlJQuery = "https://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js";

		// Google JSAPIのURL
		var urlGglJSApi = "https://www.google.com/jsapi";

		/*
		 *--------------------------------------------------
		 */

		/**
		 *	@variable	WebSrch.ready(fnc)
		 *	@title	google検索オブジェクト・ロード後のコールバック
		 *	@description
		 *
		 *		「google.setOnLoadCallback」と等価。短縮表記用。
		 *
		 *		HTMLページ読み込み直後に処理を行う際は、
		 *		この関数の引数に、処理を行う関数をセットして実行させる。
		 *
		 *		また、HTMLページ読み込み直後には、「init」だけ行っておき、
		 *		その後の検索処理は、ボタンクリックなどのイベント発生時に行わせてもよい。
		 *
		 *	@param	fnc		検索オブジェクト・ロード後に実行させる関数。
		 *	@return	なし（メソッド・チェーン不可）。
		 */
		this.ready = function(fnc) {
			// googleオブジェクトがなければ読み込む
			if (! ("google" in window)		// Chromeではgoogleオブジェクトが名前だけ存在している
			 || ! google.setOnLoadCallback	// ので「google.setOnLoadCallback」の有無を確認する。
			) {
				loadGgl(fnc, null);
				return;
			}

			// ロード時実行を開始
			google.setOnLoadCallback(fnc);
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.loadGgl(fnc, arg)
		 *	@title	googleローダーの読み込み
		 *	@description
		 *
		 *		googleローダーがまだ初期化されていなければ、googleローダーを読み込む。
		 *
		 *	@return	なし。
		 */
		function loadGgl(fnc, arg) {
			if (! document.readyState
				|| document.readyState === "loaded"
				|| document.readyState === "complete"
			) {
				// googleの読み込みを実行
				loadJS(urlGglJSApi, fnc, arg);	// 実行後に呼び出し元に戻す
			} else {
				setTimeout(function(){
					loadGgl(fnc, arg);		// JSのロード
				}, 10);
			}
		}

		/*
		 *--------------------------------------------------
		*/

		// 命令用の変数
		var cmnds = [];		// 命令を格納する配列
		var execCnt = 0;	// 命令の現在実行位置を保持する変数

		// 挿入モードのオン/オフ
		var isInsrtOn = false;	// 挿入モードがオンか？
		var insrtPos  = 0;		// 挿入モード時の挿入位置

		/**
		 *	@variable	WebSrch.reset()
		 *	@title	命令のリセット
		 *	@description
		 *
		 *		登録していた命令を全て削除する。
		 *
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.reset = function() {
			cmnds = [];
			return this;
		};

		/**
		 *	@variable	WebSrch.start()
		 *	@title	命令の開始
		 *	@description
		 *
		 *		登録していた命令を全て実行する。
		 *		命令の開始は、非同期で開始される。
		 *		メソッド・チェーンの末尾に記述するメソッド。
		 *
		 *	@return	なし（メソッド・チェーン不可）。
		 */
		this.start = function() {
			initExecVar();			// 実行設定の初期化
			self.isExec = true;		// 実行中（googleオブジェクト読み込み時にthisの
									// 対象が変わるのでselfで指定）

			// googleオブジェクトがなければ読み込む
			if (! ("google" in window)		// Chromeではgoogleオブジェクトが名前だけ存在している
			 || ! google.setOnLoadCallback	// ので「google.setOnLoadCallback」の有無を確認する。
			) {
				loadGgl(self.start, null);
				return;
			}

			// 非同期で実行開始
			setTimeout(nextExec, 1);
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.initExecVar()
		 *	@title	実行設定の初期化
		 *	@description
		 *
		 *		実行用変数の初期化
		 *
		 *	@return	なし。
		 */
		function initExecVar() {
			self.isExec = false;	// 実行中をfalseに
			execCnt = 0;			// 命令の現在実行位置
			insrtPos = 0;			// 挿入モード時の挿入位置
			self.loopCnt = -1;		// ループのカウント
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.nextExec()
		 *	@title	命令の逐次実行処理
		 *	@description
		 *
		 *		登録していた命令を1つずつ実行する。
		 *		内部処理用のメソッド。外部からの呼び出しは行わない。
		 *
		 *	@return	なし。
		 */
		function nextExec() {
			// 終了判定
			if (execCnt >= cmnds.length || self.isExec == false) {
				initExecVar();		// 実行設定の初期化
				return;				// 実行終了
			}

			// 変数の初期化
			var cmnd = cmnds[execCnt];
			eachCall();	// 毎回処理
			execCnt ++;			// カウント処理

			// 実行処理
			if (cmnd.fnc && cmnd.prm) {
				cmnd.fnc(cmnd.prm);		// 命令を実行
			}
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.pushCmnds(arg)
		 *	@title	命令の登録
		 *	@description
		 *
		 *		命令を登録する。通常時は、命令は末尾に追加していく。
		 *		挿入モードがオンの場合は、現在実行位置の次の位置に、次々と追加していく。
		 *
		 *	@param	arg		引数となるオブジェクト。
		 *	@return	取得した値。
		 */
		this.pushCmnds = function(arg) {
			if (! isInsrtOn) {
				// 通常時
				cmnds.push(arg);
			} else {
				// 挿入モード時
				if (insrtPos >= cmnds.length) {
					// 実行位置が末尾
					cmnds.push(arg);
				} else {
					// 実行位置が途中
					var pos = insrtPos > 0 ? insrtPos : 1;
					var arr0 = cmnds.slice(0, pos);
					var arr1 = cmnds.slice(pos);
					arr0.push(arg);
					cmnds = arr0.concat(arr1);
					insrtPos ++;
				}
			}
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.getPrm(arg)
		 *	@title	値の取得
		 *	@description
		 *
		 *		引数などに使うオブジェクトから値を取得する。
		 *		文字列や数値なら、その値をそのまま返し、関数なら戻り値を返す。
		 *
		 *	@param	obj		値を取得するオブジェクト。
		 *	@return	取得した値。
		 */
		function getPrm(obj) {
			if (obj) {
				if (obj instanceof Function) {
					return obj();
				} else {
					return obj;
				}
			}
			return null;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.getIntrvl()
		 *	@title	インターバルの取得
		 *	@description
		 *
		 *		インターバル用のオブジェクトから数値を取得する。
		 *		文字列や数値なら、数値を戻し、関数なら戻り値を数値化して戻す。
		 *
		 *	@return	インターバルの取得。
		 */
		function getIntrvl() {
			var intrvl = 0;
			if (self.intrvl) {
				if (self.intrvl instanceof Function) {
					intrvl = self.intrvl();
				} else {
					intrvl = self.intrvl;
				}
			}
			if (! intrvl) intrvl = 0;
			return intrvl * 1;
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.insrtOn()
		 *	@title	挿入モードを有効に
		 *	@description
		 *
		 *		挿入モードを有効にする。これ以降、挿入モードを無効にするまで、
		 *		現在実行位置の直後に、次々と命令を追加していく。
		 *
		 *		※この命令は、呼び出された瞬間に効果を発揮する。
		 *		　命令の登録ではなく、単なるモードの変更である。
		 *
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.insrtOn = function() {
			insrtPos = execCnt;
			isInsrtOn = true;
			return this;
		}

		/**
		 *	@variable	WebSrch.insrtOff()
		 *	@title	挿入モードを無効に
		 *	@description
		 *
		 *		挿入モードを無効にする。これ以降、命令を追加すると、末尾に追加されていく。
		 *
		 *		※この命令は、呼び出された瞬間に効果を発揮する。
		 *		　命令の登録ではなく、単なるモードの変更である。
		 *
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.insrtOff = function() {
			isInsrtOn = false;
			return this;
		}

		/*
		 *--------------------------------------------------
		*/

		// 毎回処理関数
		var eachCall = function(){};

		/**
		 *	@variable	WebSrch.setEachCall(arg)
		 *	@title	毎回処理追加
		 *	@description
		 *
		 *		ステップごとに呼び出される処理を追加する。
		 *
		 *	@param	arg		関数。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.setEachCall = function(arg) {
			this.pushCmnds({prm : arg, fnc : doSetEachCall});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doSetEachCall(arg)
		 *	@title	毎回処理追加 実行
		 *	@description
		 *
		 *		ステップごとに呼び出される処理を追加する。
		 *
		 *	@param	arg		関数。
		 *	@return	this（メソッドチェーン可能）。
		 */
		function doSetEachCall(arg) {
			eachCall = arg;
			nextExec();		// 次の命令を実行
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.brand(arg)
		 *	@title	googleのブランド表示
		 *	@description
		 *
		 *		ブランド表示を行う、表示先のエレメントIDを引数として指定する。
		 *
		 *	@param	arg		エレメントのID。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.brand = function(arg) {
			this.pushCmnds({prm : arg, fnc : doBrand});
			return this;
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.doBrand(arg)
		 *	@title	googleのブランド表示 実行
		 *	@description
		 *
		 *		登録した「brand」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doBrand(arg) {
			// google.searchの初期化確認
			if (! google.search) {
				// google.searchオブジェクトが不在
				loadGglJS("search", "1", doBrand, arg);
				return;
			}

			// ブランド表示
			var eleBrnd = document.getElementById(arg);
			google.search.Search.getBranding(eleBrnd);
			nextExec();		// 次の命令を実行
		};

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.init(arg)
		 *	@title	初期化処理
		 *	@description
		 *
		 *		Google検索オブジェクトの初期化処理を行う。
		 *
		 *	@param	arg.type	種類を指定（web, img, nws）
		 *	@param	arg.opt		検索オブジェクトを受け取る関数を指定。
		 *						この関数の中で、Google検索オブジェクトの追加の設定を行う。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.init = function(arg) {
			this.pushCmnds({prm : arg, fnc : doInit});
			return this;
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.doInit(arg)
		 *	@title	初期化処理 実行
		 *	@description
		 *
		 *		登録した「init」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doInit(arg) {
			// google.searchの初期化確認
			if (! google.search) {
				// google.searchオブジェクトが不在
				loadGglJS("search", "1", doInit, arg);
				return;
			}

			// 初期化処理
			if (arg && arg.type) {
				var obj = null;
				for (var key in self.srchPrms) {
					if (arg.type == key) {
						obj = self.srchPrms[key].obj = self.srchPrms[key].init();
						break;
					}
				}
				if (obj && "opt" in arg && arg.opt instanceof Function) {
					arg.opt(obj);	// 追加設定
				}
			}
			nextExec();		// 次の命令を実行
		};

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@access	private
		 *	@variable	WebSrch.loadGglJS(typ, ver, fnc, arg)
		 *	@title	Googleオブジェクトのロード
		 *	@description
		 *
		 *		Googleオブジェクトが初期化されていない場合に読み込む処理。
		 *
		 *	@param	typ		読み込むオブジェクト。
		 *	@param	ver		バージョン。
		 *	@param	fnc		追加実行する関数。
		 *	@param	arg		追加実行する関数の引数。
		 *	@return	なし。
		 */
		function loadGglJS(typ, ver, fnc, arg) {
			if (autoJSInit) {
				autoJSInit = false;	// 自動初期化終了
				alert("err : can't load " + typ + " " + ver + ".");
				self.cmndsBreak();	// 命令処理終了
				nextExec();			// 次の命令を実行
				return;
			}
			autoJSInit = true;		// 自動初期化開始
			google.load(typ,  ver, {callback: function() {
				autoJSInit = false;	// 自動初期化終了
				fnc(arg);			// 再度関数を実行
			}});
			return;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.loadJS(typ, ver, fnc, arg)
		 *	@title	JSのロード
		 *	@description
		 *
		 *		外部JavaScriptを読み込む処理。
		 *		外部JavaScriptのオブジェクトが初期化されていない場合に利用する。
		 *
		 *	@param	url		読み込む外部JavaScriptのURL。
		 *	@param	fnc		追加実行する関数。
		 *	@param	arg		追加実行する関数の引数。
		 *	@return	なし。
		 */
		function loadJS(url, fnc, arg) {
			if (autoJSInit) {
				autoJSInit = false;	// 自動初期化終了
				alert("err : can't load " + url + ".");
				self.cmndsBreak();	// 命令処理終了
				nextExec();			// 次の命令を実行
				return;
			}
			autoJSInit = true;		// 自動初期化開始

			// scriptタグの追加
			var head = document.getElementsByTagName("head")[0]
					|| document.documentElement;
			var script = document.createElement("script");
			script.charset = "UTF-8";
			script.src = url;

			var isDone = false;
			script.onload = script.onreadystatechange = function() {
				// 読み込み後処理
				if (! isDone
				 && (! this.readyState
					|| this.readyState === "loaded"
					|| this.readyState === "complete"
					)
				) {
					isDone = true;

					// 実行
					autoJSInit = false;	// 自動初期化終了
					fnc(arg);			// 再度関数を実行

					// IEメモリー・リーク対策
					script.onload = script.onreadystatechange = null;
					if (head && script.parentNode) {
						head.removeChild(script);
					}
				}
			};

			// IE6バグ対策付きでscriptを追加
			head.insertBefore(script, head.firstChild);
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.add(arg)
		 *	@title	追加処理
		 *	@description
		 *
		 *		引数として、追加実行する関数を指定。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.add = function(arg) {
			this.pushCmnds({prm : arg, fnc : doAdd});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doAdd(arg)
		 *	@title	追加処理 実行
		 *	@description
		 *
		 *		登録した「add」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doAdd(arg) {
			if (arg) arg();	// 関数を実行
			nextExec();		// 次の命令を実行
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.end(arg)
		 *	@title	終了処理
		 *	@description
		 *
		 *		命令の実行処理を終了する。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.end= function(arg) {
			this.pushCmnds({prm : arg, fnc : doEnd});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doEnd(arg)
		 *	@title	追加処理 実行
		 *	@description
		 *
		 *		登録した「add」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doEnd(arg) {
			if (arg) arg();			// 関数を実行
			self.isExec = false;	// 実行中をfalseに
			nextExec();				// 次の命令を実行
		}

		/*
		 *--------------------------------------------------
		*/

		// コールバック・ループ用の変数
		var nowArg;			// 一時的な検索引数の格納

		/**
		 *	@variable	WebSrch.loopCnt
		 *	@title	ループのカウント
		 *	@description
		 *		検索などのループ指定を行える処理の場合に、現在のループ回数を取得するための変数。
		 *
		 *		詳しくはサンプルのソースコードを参照。
		 */
		this.loopCnt = -1;	// ループのカウント

		/**
		 *	@variable	WebSrch.addCallback(arg)
		 *	@title	追加処理 コールバック
		 *	@description
		 *
		 *		引数として、コールバック付きの追加実行する関数を指定。
		 *		このメソッド内で行うコールバック処理が終わったタイミングで、
		 *		「endCallback」を呼び出す。そうすれば、次の命令に移動して
		 *		実行が継続される。
		 *
		 *	@param	arg.init	ループ実行前の処理を関数で指定。
		 *	@param	arg.loop	ループ回数の数字か関数を指定。
		 *	@param	arg.exec	処理を行う関数を指定。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.addCallback = function(arg) {
			this.pushCmnds({prm : arg, fnc : doAddCallback});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doAddCallback(arg)
		 *	@title	追加処理 コールバック 実行
		 *	@description
		 *
		 *		登録した「addCallback」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doAddCallback(arg) {
			// エラー対策
			if (! arg) {loopUnable(); return}	// ループ無効

			// 値の展開
			initNowArg(arg);
			nowArg.exec = arg.exec;

			// コールバック処理の実行
			if (arg.exec) {
				nowArg.exec();	// 関数を実行
			} else {
				loopUnable();	// ループ無効
			}
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.initNowArg(arg)
		 *	@title	現在引数の初期化
		 *	@description
		 *
		 *		コールバック系処理の、現在引数を初期化する。
		 *
		 *	@param	arg		追加実行する関数オブジェクト
		 *	@return	なし。
		 */
		function initNowArg(arg) {
			// 現在引数を初期化
			nowArg = {};

			// 初期化処理
			//	ループが始まる前に一度だけ実行される。
			//	ループ回数の展開の前に行う。
			if (self.loopCnt == -1) {
				self.loopCnt = 0;		// ループ・カウントを0にセット
				if (arg.init && arg.init instanceof Function) {
					arg.init();
				}
			}

			// ループ回数
			nowArg.loop = getPrm(arg.loop);
			nowArg.loop = (! nowArg.loop || nowArg.loop <= 0) ? 1 : nowArg.loop;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.loopUnable()
		 *	@title	ループ無効
		 *	@description
		 *
		 *		ループ無効時の処理。カウントを初期値にして、次の命令に移行する。
		 *
		 *	@return	なし（メソッドチェーン不可）。
		 */
		function loopUnable() {
			self.loopCnt = -1;	// ループのカウントを初期値に
			nextExec();		// 次の命令を実行
		}

		/**
		 *	@variable	WebSrch.endCallback()
		 *	@title	追加処理 コールバック 終了時用
		 *	@description
		 *
		 *		登録した「addCallback」命令の終了時に呼び出すメソッド。
		 *		この命令が呼ばれると、次の処理が実行される。
		 *
		 *	@return	なし。
		 */
		this.endCallback = function() {
			// ループのカウント
			var arg = nowArg;
			self.loopCnt ++;
			if (self.loopCnt < arg.loop) {
				execCnt --;		// カウント処理を戻す
			} else {
				self.loopCnt = -1;	// ループを無効に
			}

			// 命令を実行
			var intrvl = getIntrvl();	// インターバル
			if (intrvl <= 0) {
				nextExec();		// 次の命令を実行
			} else {
				setTimeout(nextExec, intrvl);	// インターバルで実行
			}
		}

		/**
		 *	@variable	WebSrch.loopBreak()
		 *	@title	ループ終了
		 *	@description
		 *
		 *		ループ処理中で、ループを打ち切るフラグを立てるためのメソッド。
		 *
		 *	@return	なし（メソッドチェーン不可）。
		 */
		this.loopBreak = function() {
			nowArg.loop = 0;
		}

		/**
		 *	@variable	WebSrch.cmndsBreak()
		 *	@title	命令処理終了
		 *	@description
		 *
		 *		命令処理中に、条件に応じて全ての処理を終了するためのメソッド。
		 *		これ以降の命令を全て無効にして、現在実行中の処理までで終了する。
		 *
		 *	@return	なし（メソッドチェーン不可）。
		 */
		this.cmndsBreak = function() {
			this.isExec = false;
		}

		/*
		 *--------------------------------------------------
		*/

		// 検索用の変数
		var nowSrchObj;		// 一時的な検索オブジェクトの格納
		var pgCnt;			// ページのカウント
		var srchResArr;		// 検索結果配列
		this.srchKw = "";	// 検索キーワード

		/**
		 *	@variable	WebSrch.srch(arg)
		 *	@title	検索
		 *	@description
		 *
		 *		検索の種類とループ回数を指定して、検索を行う。
		 *		検索は、実行毎に「arg.key」の引数で指定した関数の戻り値を検索語として利用する。
		 *		検索の結果は、「arg.res」の引数で指定した関数の戻り値として受け取る。
		 *
		 *	@param	arg.init	ループ実行前の処理を関数で指定。
		 *	@param	arg.loop	ループの回数を指定。
		 *	@param	arg.type	種類を指定（web, img, nws, blg）。
		 *	@param	arg.page	検索結果のページを、何ページ分取得するか指定。
		 *	@param	arg.key		戻り値にキーワードを返す関数を指定。
		 *	@param	arg.res		結果を受け取る関数を指定。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.srch = function(arg) {
			this.pushCmnds({prm : arg, fnc : doSrch});
			return this;
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.doSrch(arg)
		 *	@title	検索 実行
		 *	@description
		 *
		 *		登録した「srch」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doSrch(arg) {
			// エラー対策
			if (! arg) {loopUnable(); return}	// ループ無効

			// 値の展開
			initNowArg(arg);

			nowArg.type = getPrm(arg.type) || "";

			nowArg.page = getPrm(arg.page); 
			nowArg.page = (! nowArg.page || nowArg.page <= 0) ? 1 : nowArg.page;

			nowArg.key  = getPrm(arg.key);
			nowArg.res  = arg.res;

			// 検索オブジェクトの取得
			var obj = null;
			for (var key in self.srchPrms) {
				if (nowArg.type == key) {
					obj = self.srchPrms[key].obj;

					// Searcherオブジェクトの初期化確認
					if (obj == null) {
						if (autoSrcherInit) {
							// 無限ループ対策
							autoSrcherInit = false;	// 自動初期化開始
							//alert("err : can't use Searcher type " + nowArg.type + ".");
							console.warn("err : can't use Searcher type " + nowArg.type + ".");
							self.cmndsBreak();	// 命令処理終了
							nextExec();			// 次の命令を実行
							return;
						}
						autoSrcherInit = true;	// 自動初期化開始
						var newArg = {type: nowArg.type};
						execCnt --;			// カウント処理を戻す
						doInit(newArg);		// 初期化を行う
						return;
					}

					break;
				}
			}
			autoSrcherInit = false;	// 自動初期化開始

			// 検索の実行
			if (obj != null && nowArg.key) {
				nowSrchObj = obj;	// 一時的な検索オブジェクトの格納
				pgCnt = 0;			// ページ位置の初期化
				srchResArr = [];	// 検索結果配列の初期化
				obj.setSearchCompleteCallback(this, function(){
					doPage();
				}, null);
				self.srchKw = nowArg.key;	// 検索キーワード
				obj.execute(nowArg.key);
			} else {
				loopUnable();	// ループ無効
			}
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.doPage()
		 *	@title	検索 ページング
		 *	@description
		 *
		 *		登録した「srch」のページ処理を行うためのメソッド。
		 *
		 *	@return	なし。
		 */
		function doPage() {
			// 変数の初期化
			pgCnt ++;
			var obj = nowSrchObj;
			var arg = nowArg;
			var res = obj.results;

			appndRes();			// 結果追加
			eachCall();	// 毎回処理

			// 結果の格納
			if (res && res.length > 0) {
				srchResArr = srchResArr.concat(res);	// 検索結果の連結
			}

			// ページ数
			var pgMax = 0;
			if (obj.cursor && obj.cursor.pages) pgMax = obj.cursor.pages.length;

			// 結果による分岐
			if (pgCnt < arg.page && pgCnt < pgMax) {
				// ページめくりが継続
				var intrvl = getIntrvl();	// インターバル
				if (intrvl <= 0) {
					obj.gotoPage(pgCnt);		// 次のページを実行
				} else {
					setTimeout(function() {		// インターバルで実行
						obj.gotoPage(pgCnt);	// 次のページを実行
					}, intrvl);
				}
			} else {
				// ページめくりが終了
				arg.res(srchResArr, obj.cursor);	// 引数の関数に結果を入れて実行
				self.endCallback();
			}
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.feed(arg)
		 *	@title	フィード検索
		 *	@description
		 *
		 *		RSSフィードをJSONにして取得する。
		 *
		 *	@param	arg.init	ループ実行前の処理を関数で指定。
		 *	@param	arg.loop	ループ回数の数字か関数を指定。
		 *	@param	arg.url		読み込むRSSのURLを関数の戻り値として指定。
		 *	@param	arg.res		結果を受け取る関数を指定。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.feed = function(arg) {
			this.pushCmnds({prm : arg, fnc : doFeed});
			return this;
		};

		/**
		 *	@access	private
		 *	@variable	WebSrch.doFeed(arg)
		 *	@title	フィード検索 実行
		 *	@description
		 *
		 *		登録した「feed」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト
		 *	@return	なし。
		 */
		function doFeed(arg) {
			// エラー対策
			if (! arg) {loopUnable(); return}	// ループ無効

			// google.feedsの初期化確認
			if (! google.feeds) {
				// google.feedsオブジェクトが不在
				loadGglJS("feeds", "1", doFeed, arg);
				return;
			}

			// 値の展開
			initNowArg(arg);
			nowArg.url  = getPrm(arg.url);
			nowArg.res  = arg.res;

			// フィード検索の実行
			if (nowArg.url != "" && nowArg.res instanceof Function) {
				var feed = new google.feeds.Feed(nowArg.url);
				feed.setNumEntries(100);	// 100取得
				feed.load(function(res){
					nowArg.res(res)
					self.endCallback();
				});
			} else {
				loopUnable();	// ループ無効
			}
		};

		/*
		 *--------------------------------------------------
		*/

		// 検索結果追加先（検索が行われるごとに呼び出される）
		/**
		 *	@variable	WebSrch.appndResTgt
		 *	@title	検索結果追加先の要素ID
		 *	@description
		 *		検索が行われるとごとに、検索結果を出力させるために使用。要素IDを指定する。
		 *
		 *		デフォルトは空文字（指定なし）。
		 *
		 *		詳しくはサンプルのソースコードを参照。
		 */
		this.appndResTgt = "";		// 検索結果追加先の要素ID

		/**
		 *	@variable	WebSrch.appndResDeco
		 *	@title	検索結果追加の加工用関数
		 *	@description
		 *		検索が行われるとごとに、検索結果を出力させるために使用。
		 *		出力を加工するための関数を指定。
		 *
		 *		デフォルトはnull。
		 *
		 *		詳しくはサンプルのソースコードを参照。
		 */
		this.appndResDeco = null;	// 検索結果追加の加工用関数

		/**
		 *	@access	private
		 *	@variable	WebSrch.appndRes()
		 *	@title	結果追加
		 *	@description
		 *
		 *		検索が行われるごとに、検索結果を出力するために呼び出される内部関数。
		 *
		 *	@return	なし。
		 */
		function appndRes() {
			// 出力先の初期化
			if (self.appndResTgt == "") return;		// 不使用時
			var ele = document.getElementById(self.appndResTgt);
			if (! ele) return;		// 不正な指定
			var tagName = ele.tagName;
			var isTextArea = !! tagName.match(/textarea/i);

			// 変数の初期化
			var appndStr = "";
			var obj = nowSrchObj;
			var res = obj.results;

			if (! res || res.length <= 0) return;

			var deco;
			if (self.appndResDeco != null) {
				deco = self.appndResDeco;
			} else
			if (isTextArea) {
				deco = function(r) {
					var resStr = "";
					for (var key in r) {
						resStr += key + " : " + r[key] + "\n";
					}
					resStr += "-----\n";
					return resStr;
				};
			} else {
				deco = function(r) {
					var resStr = "";
					for (var key in r) {
						resStr += '<div class="appndRes">'
							+ key + " : " + r[key] + "</div>";
					}
					resStr += '<hr class="appndResSplt">';
					return resStr;
				};
			}

			// 加工処理
			for (var i = 0; i < res.length; i ++) {
				// 検索結果の追加
				if (isTextArea) {
					ele.value += deco(res[i]);
				} else {
					ele.innerHTML += deco(res[i]);
				}
			}
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.shrtUrl(arg)
		 *	@title	短縮URL
		 *	@description
		 *
		 *		短縮URLの作成を行う。
		 *
		 *	@param	arg.init	ループ実行前の処理を関数で指定。
		 *	@param	arg.loop	ループ回数の数字か関数を指定。
		 *	@param	arg.url		変換を行うURLの文字列か関数を指定。
		 *	@param	arg.res		結果を受け取る関数を指定。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.shrtUrl = function(arg) {
			this.pushCmnds({prm : arg, fnc : doShrtUrl});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doShrtUrl(arg)
		 *	@title	短縮URL 実行
		 *	@description
		 *
		 *		登録した「shrtUrl」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doShrtUrl(arg) {
			// エラー対策
			if (! arg) {loopUnable(); return}	// ループ無効

			// jQueryの初期化確認
			if (! ("$" in window)) {
				// jQueryオブジェクトが不在
				loadJS(urlJQuery, doShrtUrl, arg);
				return;
			}

			// 値の展開
			initNowArg(arg);
			nowArg.url = getPrm(arg.url) || "";
			nowArg.res = arg.res;

			// コールバック処理の実行
			if (nowArg.url != "" && nowArg.res instanceof Function) {
				// 短縮URLの取得
				$.getJSON(
					"http://json-tinyurl.appspot.com/?&callback=?",
					{url: nowArg.url}, 
					function(data){
						nowArg.res(data.tinyurl);
						self.endCallback();
					}
				); 
			} else {
				loopUnable();	// ループ無効
			}
		}

		/*
		 *--------------------------------------------------
		*/

		/**
		 *	@variable	WebSrch.sgst(arg)
		 *	@title	Google Suggest
		 *	@description
		 *
		 *		Google Suggestを利用して、関連語の取得を行う。
		 *
		 *		戻り値を受け取る「arg.res」関数は、1つの連想配列を引数として受け取る。
		 *		この引数の連想配列の内容は以下の通り。
		 *
		 *		「res : function(res) {}」の場合
		 *
		 *		res.jsonp …… 取得したJSONPの生データ。<br>
		 *		res.raw …… 取得したデータ部分の生配列。<br>
		 *		res.wrd …… 取得したデータを単語の配列にしたもの。
		 *					以降のデータは、半角スペースが入った文字列は分割して格納。<br>
		 *		res.hd …… 検索文字を先頭に含む文字列配列（hd = head）。
		 *					「本」で検索して「本と私」という結果があれば「本と私」を格納。<br>
		 *		res.not …… 検索文字を含まない単語配列。
		 *					「本」で検索して「本と私」という結果があれば無視する。<br>
		 *
		 *		検索語の末尾に半角スペースを入れると、関連語の一覧が取得できる。
		 *		その際は「res.not」を使って関連語のリストを取得するとよい。
		 *
		 *		検索語の末尾に半角スペースを入れるなければ、その語に続く文章が取得できる。
		 *		その際は「res.hd」を使って文字列を取得するとよい。
		 *
		 *	@param	arg.init	ループ実行前の処理を関数で指定。
		 *	@param	arg.loop	ループ回数の数字か関数を指定。
		 *	@param	arg.kw		検索するキーワードの文字列か関数を指定。
		 *	@param	arg.res		結果を受け取る関数を指定。
		 *	@return	this（メソッドチェーン可能）。
		 */
		this.sgst = function(arg) {
			this.pushCmnds({prm : arg, fnc : doSgst});
			return this;
		}

		/**
		 *	@access	private
		 *	@variable	WebSrch.doSgst(arg)
		 *	@title	Google Suggest 実行
		 *	@description
		 *
		 *		登録した「doSgst」命令の実行。
		 *
		 *	@param	arg		追加実行する関数オブジェクト。
		 *	@return	なし。
		 */
		function doSgst(arg) {
			// エラー対策
			if (! arg) {loopUnable(); return}	// ループ無効

			// jQueryの初期化確認
			if (! ("$" in window)) {
				// jQueryオブジェクトが不在
				loadJS(urlJQuery, doSgst, arg);
				return;
			}

			// 値の展開
			initNowArg(arg);
			nowArg.kw  = getPrm(arg.kw) || "";
			nowArg.res = arg.res;
			nowArg.hl  = arg.hl;
			var url  = "https://www.google.com/complete/search?hl=" + nowArg.hl + "&q=" + nowArg.kw + "&output=toolbar";

			// コールバック処理の実行
			if (nowArg.kw != "" && nowArg.res instanceof Function) {
				// Google Suggestの取得
				$.ajax({
					type : "GET",
					async : true,
					dataType : "xml",
					url : url,
					success : function(xml){
						/*
						 *	Suggestの戻り値の構造
						 *	callback(
						 * 		検索キーワード,
						 * 		[戻り値の配列],
						 * 		[空文字列の配列],
						 * 	)
						 */
						var resArg = {
							jsonp: xml,	// 取得したJSONPの生データ。
							raw: [],	// 取得したデータ部分の生配列。
						};

						$(xml).find("CompleteSuggestion").each(function() {
							resArg.raw.push( $(this).find("suggestion").attr("data") );
						});

						// 登録関数の実行
						nowArg.res(resArg);
						self.endCallback();
					},
					error : function(XMLHttpRequest, textStatus, errorThrown) {
						console.log("error:"+textStatus);
						self.cmndsBreak();
					}
				}); 
			} else {
				loopUnable();	// ループ無効
			}
		}
	};

