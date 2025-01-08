var mapView = new ol.View({
  center: ol.proj.fromLonLat([97.15076719829108, 5.176164251666557]),
  zoom: 17,
});

var map = new ol.Map({
  target: "map",
  view: mapView,
});

var osmFile = new ol.layer.Tile({
  title: "Open Street Map",
  visible: true,
  source: new ol.source.OSM(),
});

map.addLayer(osmFile);

var googleSatLayer = new ol.layer.Tile({
  title: "Google Satelite",
  visible: true,
  source: new ol.source.XYZ({
    url: "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    maxZoom: 20,
    tilePixelRatio: 1,
    tileSize: 256,
    projection: "EPSG:3857",
  }),
});

map.addLayer(googleSatLayer);

var createLayer = function (title, layerName) {
  return new ol.layer.Tile({
    title: title,
    source: new ol.source.TileWMS({
      url: "https://fc70-36-91-52-250.ngrok-free.app/geoserver/gisKotaLhokseumawe/wms",
      params: { LAYERS: "gisKotaLhokseumawe:" + layerName, TILED: true },
      serverType: "geoserver",
      visible: true,
    }),
  });
};

var polygonGroup = new ol.layer.Group({
  title: "Polygon",
  layers: [
    createLayer("Batas gampong", "batas-gampong"),
    createLayer("Bank", "bank"),
    createLayer("Bengkel", "bengkel"),
    createLayer("Gudang", "gudang"),
    createLayer("Hotel", "hotel"),
    createLayer("Kantor", "kantor"),
    createLayer("Kios", "kios"),
    createLayer("Lahan kosong", "lahan_kosong"),
    createLayer("Lapangan", "lapangan"),
    createLayer("Masjid", "masjid"),
    createLayer("Meunasah", "meunasah"),
    createLayer("Mushola", "mushola"),
    createLayer("Pasar", "pasar"),
    createLayer("Posko", "posko"),
    createLayer("Ruko", "ruko"),
    createLayer("Rumah", "rumah2"),
    createLayer("Rumah pribadi", "rumah_sendiri"),
    createLayer("Sekolah", "sekolah"),
    createLayer("Warung", "warung"),
  ],
});

map.addLayer(polygonGroup);

// Inisialisasi Layer Polyline
var polylineGroup = new ol.layer.Group({
  title: "Polyline",
  layers: [
    createLayer("Jalan", "jalan"),
    createLayer("Lorong", "lorong-gampong"),
    createLayer("Parit", "parit"),
  ],
});

map.addLayer(polylineGroup);

// Inisialisasi Layer Point
var pointGroup = new ol.layer.Group({
  title: "Point",
  layers: [
    createLayer("Point rumah", "poinrumah"),
    createLayer("Point bank", "point_bank"),
    createLayer("Point bengkel", "point_bengkel"),
    createLayer("Point gudang", "point_gudang"),
    createLayer("Point hotel", "point_hotel"),
    createLayer("Point kantor", "point_kantor"),
    createLayer("Point kios", "point_kios"),
    createLayer("Point lahan kosong", "point_lahankosong"),
    createLayer("Point lapangan", "point_lapangan"),
    createLayer("Point masjid", "point_masjid"),
    createLayer("Point meunasah", "point_meunasah"),
    createLayer("Point mushola", "point_mushola"),
    createLayer("Point pasar", "point_pasar"),
    createLayer("Point posko", "point_posko"),
    createLayer("Point ruko", "point_ruko"),
    createLayer("Point rumah pribadi", "point_rumahsendiri"),
    createLayer("Point sekolah", "point_sekolah"),
    createLayer("Point warung", "point_warung"),
  ],
});
map.addLayer(pointGroup);

var layerSwitcher = new ol.control.LayerSwitcher({
  activationMode: "click",
  startActive: false,
  groupSelectStyle: "children",
});

map.addControl(layerSwitcher);

var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");

var popup = new ol.Overlay({
  element: container,
  autoPan: true,
  autoAnimation: {
    duration: 250,
  },
});

map.addOverlay(popup);

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

function handlePopupLayer(
  layerName,
  featureInfoProperties,
  extraProperties = {}
) {
  map.on("singleclick", function (evt) {
    content.innerHTML = "";
    var resolution = mapView.getResolution();
    var url = createLayer(layerName, layerName.toLowerCase())
      .getSource()
      .getFeatureInfoUrl(evt.coordinate, resolution, "EPSG:3857", {
        INFO_FORMAT: "application/json",
        propertyName: featureInfoProperties,
      });

    if (url) {
  console.log("Feature Info URL:", url);
  $.getJSON(url, function (data) {
    console.log("Feature Info Response:", data);
    if (data.features && data.features.length > 0) {
      var feature = data.features[0];
      var props = feature.properties;
      var popupContent = Object.entries(extraProperties)
        .map(
          ([key, label]) => `<div><strong>${label}:</strong> ${props[key]}</div>`
        )
        .join(" ");
      content.innerHTML = popupContent;
      popup.setPosition(evt.coordinate);
    } else {
      console.log("No features found");
      popup.setPosition(undefined);
    }
  }).fail(function (error) {
    console.error("Error fetching feature info:", error);
  });
} else {
  console.log("Invalid Feature Info URL");
  popup.setPosition(undefined);
}
  });
}

handlePopupLayer(
  "rumah2", [
    "no_rumah",
    "stat_milik",
    "jnbangunan",
    "jnslantai",
    "namakk",
    "pdterakhir",
    "pekerjaan",
    "notlp",
    "noktp",
    "jmllaki",
    "jumlahpr",
    "total_huni",
    "lbangunan",
  ],  
  {
    no_rumah: "No Rumah",
    stat_milik: "Nama Pemilik",
    jnbangunan: "Jenis Bangunan",
    jnslantai: "Jenis Lantai",
    namakk: "Nama KK",
    pdterakhir: "Pendidiakn Terakhir",
    pekerjaan: "Pekerjaan",
    notlp: "No Telepon",
    noktp: "No KTP",
    jmllaki: "Jumlah Laki-Laki",
    jumlahpr: "Jumlah Perempuan",
    total_huni: "Total Penghuni",
    lbangunan: "Luas Bangunan",
  }
);

handlePopupLayer(
  "rumah_sendiri",[
    "norumah",
    "sts_milik",
    "jsbangunan",
    "jnslantai",
    "namakk",
    "pdterakhir",
    "pekerjaan",
    "notlp",
    "noktp",
    "jmllaki",
    "jmlhpr",
    "jmlhhunian",
    "lbangunan",
  ],  
  {
    norumah: "No Rumah",
    sts_milik: "Nama Pemilik",
    jsbangunan: "Jenis Bangunan",
    jnslantai: "Jenis Lantai",
    namakk: "Nama KK",
    pdterakhir: "Pendidiakn Terakhir",
    pekerjaan: "Pekerjaan",
    notlp: "No Telepon",
    noktp: "No KTP",
    jmllaki: "Jumlah Laki-Laki",
    jmlhpr: "Jumlah Perempuan",
    jmlhhunian: "Total Penghuni",
    lbangunan: "Luas Bangunan",
  }
);

handlePopupLayer(
  "bank", 
  [
    "l_bangunan",
    "luas_tanah",
    "nocontact",
    "nama_bank",
    "kepalabank",
  ],  
  {
    l_bangunan: "Luas Bangunan",
    luas_tanah: "Luas Tanah",
    nocontact: "No Kontak",
    nama_bank: "Nama Bank",
    kepalabank: "Kepala Bank",
  }
);


handlePopupLayer(
  "bengkel", 
  [
    "nmpemilik",
    "nocontact",
    "jsusaha",
    "lbangunan",
    "luastanah",
  ],  
  {
    nmpemilik: "Nama Pemilik Bengkel",
    nocontact: "No Kontak",
    jsusaha: "Jenis Usaha",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
  }
);


handlePopupLayer(
  "gudang", 
  [
    "nmpemilik",
    "nocontact",
    "jnsusaha",
    "stsusaha",
    "lbangunan",
    "luaslahan",
  ],  
  {
    nmpemilik: "Nama Pemilik Gudang",
    nocontact: "No Kontak",
    jnsusaha: "Jenis Usaha",
    stsusaha: "Status Usaha",
    lbangunan: "Luas Bangunan",
    luaslahan: "Luas Lahan",
  }
);

handlePopupLayer(
  "hotel", 
  [
    "namahotel",
    "kpalahotel",
    "nocontact",
    "lbangunan",
    "luastanah",
  ],  
  {
    namahotel: "Nama Hotel",
    kpalahotel: "Kepala Hotel",
    nocontact: "No Kontak",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
  }
);

handlePopupLayer(
  "kantor", 
  [
    "namakantor",
    "kplakantor",
    "nocontact",
    "lbangunan",
    "luastanah",
  ],  
  {
    namakantor: "Nama Kantor",
    kplakantor: "Kepala Kantor",
    nocontact: "No Kontak",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
  }
);

handlePopupLayer(
  "kios", 
  [
    "nmpemilik",
    "nocontact",
    "jnusaha",
    "stsusaha",
    "lbangunan",
    "luaslahan",
  ],  
  {
    nmpemilik: "Nama Pemilik Kios",
    nocontact: "No Kontak",
    jnusaha: "Jenis Usaha",
    stsusaha: "Status Usaha",
    lbangunan: "Luas Bangunan",
    luaslahan: "Luas Lahan",
  }
);

handlePopupLayer(
  "lahan_kosong", 
  [
    "nmpemilik",
    "nocontact",
    "jstanaman",
    "jmlhproduk",
    "jsirigasi",
    "luaslahan",
    "status",
  ],  
  {
    nmpemilik: "Nama Pemilik Lahan",
    nocontact: "No Kontak",
    jstanaman: "Jenis Tanaman",
    jmlhproduk: "Jumlah Produk",
    jsirigasi: "Jenis Irigasi",
    luaslahan: "Luas Lahan",
    status: "Status",
  }
);

handlePopupLayer(
  "lapangan", 
  [
    "nmpemilik",
    "nocontact",
    "jskegiatan",
    "luaslahan",
    "lbangunan",
  ],  
  {
    nmpemilik: "Nama Pemilik Lapanagn",
    nocontact: "No Kontak",
    jskegiatan: "Jenis Kegiatan",
    luaslahan: "Luas Lahan",
    lbangunan: "Luas Bangunan",
  }
);

handlePopupLayer(
  "masjid", 
  [
    "namamesjid",
    "lbangunan",
    "luastanah",
    "imummesjid",
    "nocontact",
  ],  
  {
    namamesjid: "Nama Masjid",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
    imummesjid: "Imam Masjid",
    nocontact: "No Kontak",
  }
);

handlePopupLayer(
  "meunasah", 
  [
    "nmmeunasah",
    "lbangunan",
    "luastanah",
    "imummenasa",
    "nocontact",
  ],  
  {
    nmmeunasah: "Nama Meunasah",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
    imummenasa: "Imam Meunasah",
    nocontact: "No Kontak",
  }
);

handlePopupLayer(
  "mushola", 
  [
    "nmmushola",
    "lbangunan",
    "luastanah",
    "nmimum",
    "nocontact",
  ],  
  {
    nmmushola: "Nama Mushola",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
    nmimum: "Nama Imam Mushola",
    nocontact: "No Kontak",
  }
);

handlePopupLayer(
  "pasar", 
  [
    "nm_pemilik",
    "nocontact",
    "jnsusaha",
    "stsusaha",
    "l_bangunan",
    "luaslahan",
  ],  
  {
    nm_pemilik: "Nama Pemilik Pasar",
    nocontact: "No Kontak",
    jnsusaha: "Jenis Usaha",
    stsusaha: "Status Usaha",
    l_bangunan: "Luas Bangunan",
    luaslahan: "Luas Lahan",
  }
);

handlePopupLayer(
  "posko", 
  [
    "namaposko",
    "kplaposko",
    "nocontact",
    "lbangunan",
    "luastanah",
  ],  
  {
    namaposko: "Nama Posko",
    kplaposko: "Kepala Posko",
    nocontact: "No Kontak",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
  }
);

handlePopupLayer(
  "ruko", 
  [
    "nm_pemilik",
    "nocontact",
    "jns_usaha",
    "stat_usaha",
    "l_bangunan",
    "luas_lahan",
  ],  
  {
    nm_pemilik: "Nama Pemilik Ruko",
    nocontact: "No Kontak",
    jns_usaha: "Jenis Usaha",
    stat_usaha: "Status Usaha",
    l_bangunan: "Luas Bangunan",
    luas_lahan: "Luas Lahan",
  }
);

handlePopupLayer(
  "sekolah", 
  [
    "nmsekolah",
    "nmkepsek",
    "nocontact",
    "lbangunan",
    "luastanah",
  ],  
  {
    nmsekolah: "Nama Sekolah",
    nmkepsek: "Nama Kepala Sekolah",
    nocontact: "No Kontak",
    lbangunan: "Luas Bangunan",
    luastanah: "Luas Tanah",
  }
);

handlePopupLayer(
  "warung", 
  [
    "nmpemilik",
    "nocontact",
    "jnsusaha",
    "stsusaha",
    "lbangunan",
    "luaslahan",
  ],  
  {
    nmpemilik: "Nama Pemilik Warung",
    nocontact: "No Kontak",
    jnsusaha: "Jenis Usaha",
    stsusaha: "Status Usaha",
    lbangunan: "Luas Bangunan",
    luaslahan: "Luas Lahan",
  }
);

handlePopupLayer(
  "jalan", 
  [
    "nama_jalan",
    "panjang",
    "lebar",
    "status_jln",
    "kondisi",
    "kategori",
    "t_perbaiki",
    "pembiayaan",
  ],  
  {
    nama_jalan: "Nama Jalan",
    panjang: "Panjang Jalan",
    lebar: "Lebar Jalan",
    status_jln: "Status Jalan",
    kondisi: "Kondisi",
    kategori: "Kategori",
    t_perbaiki: "Tanggal Perbaikan",
    pembiayaan: "Pembiayaan",
  }
);

handlePopupLayer(
  "lorong_gampong", 
  [
    "nama_lrng",
    "panjang",
    "lebar",
    "status",
    "kondisi",
    "kategori",
    "t_perbaiki",
    "status_lr",
    "pembiayaan",
  ],  
  {
    nama_lrng: "Nama Lorong",
    panjang: "Panjang Lorong",
    lebar: "Lebar Lorong",
    status: "Status",
    kondisi: "Kondisi",
    kategori: "Kategori",
    t_perbaiki: "Tanggal Perbaikan",
    status_lr: "Status Lorong",
    pembiayaan: "Pembiayaan",
  }
);

handlePopupLayer("parit", ["panjang", "lebar"], {
  panjang: "Panjang parit",
  lebar: "Lebar parit",
});
