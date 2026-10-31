import zipfile, json, re, sys
durs = json.load(open("audio/durations.json"))
src, dst = sys.argv[1], sys.argv[2]
TIMING = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
 '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
 '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
 '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
 '<p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
 '<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="{DUR}" fill="hold"/><p:tgtEl><p:spTgt spid="{SPID}"/></p:tgtEl></p:cBhvr></p:cmd>'
 '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
 '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
 '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
 '<p:audio><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
 '<p:endCondLst><p:cond evt="onStopAudio" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:endCondLst></p:cTn>'
 '<p:tgtEl><p:spTgt spid="{SPID}"/></p:tgtEl></p:cMediaNode></p:audio>'
 '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    m = re.fullmatch(r"ppt/slides/slide(\d+)\.xml", item.filename)
    if m:
        i = int(m.group(1)); x = data.decode("utf8")
        x = x.replace("<a:videoFile ", "<a:audioFile ")
        spid = re.search(r'<p:cNvPr id="(\d+)" name="Media', x).group(1)
        ms = int(durs[i - 1] * 1000)
        extra = f'<p:transition spd="med" advTm="{ms + 1500}"><p:fade/></p:transition>' + TIMING.replace("{SPID}", spid).replace("{DUR}", str(ms))
        x = x.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + extra, 1)
        data = x.encode("utf8")
    if item.filename == "[Content_Types].xml":
        x = data.decode("utf8")
        if 'Extension="mp3"' not in x:
            x = x.replace("<Default ", '<Default Extension="mp3" ContentType="audio/mpeg"/><Default ', 1)
        data = x.encode("utf8")
    zout.writestr(item, data)
zout.close(); print("ok", dst)
