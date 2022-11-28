### IsolaS2

The web-app _IsolaS2_ is intended as an entry point for quickly assessing the convenience of using Sentinel-2 MSI land-use data across a particular region or island.  MSI stands  for Multi-Spectral Imagery since there and 12 distinct spectral bands available - e.g. for monitoring vegetation across small-to-medium tracts of land.

**Live at** [https://crs4.github.io/IsolaS2/src/]

**User guide** [https://crs4.github.io/IsolaS2/src/UserGuide.html]

The motivation here is to lower the architectonic barriers experienced by unpractised users at the contemporary web-based Sentinel-2 data providers, and so boost the uptake of such data: In particular by explicitly removing:

1. the need to register, login, respect timeouts, and endure throttled downloads - at ESA's SciHub site.
2. the need to pay service subscription to download data - at CreoDIAS and EO Browser
3. the need to adopt a cloud computing paradigm in order to easily access or download the data from the GoogleStorage Sentinel-2 repository.

This web-app has become feasible due to several state-of-the-art innovations in the delivery of images and data over the web - as will be detailed later - these include: 

1. the advent of the free CreoDIAS Finder REST service to find available Sentinel data,
2. the ability to source thumbnail images from diverse online resources and swap them in when one or other goes down. 
3. the ability of browsers to mix composite images from the pixels in pairs of thumbnails.
4. the ability to deep-link to given date/geo-location combinations at the EO Browser site.
5. the free ongoing Sentinel-2 repository at GoogleStorage
6. the ability to implement a free CORS proxy using node.js on Cloudfare Workers.

Conceived first for the island of Sardinia, our web-app is configurable to run at other geo-locations -  i.e. those representable as a few contiguous 100x100 km UTC tiles - e.g. Cyprus, Corsica the Hebrides, Gotland, Zanzibar, Yorkshire, etc as shown in the Gallery Section. Indeed once the user navigates to the page configured for their geo-location all they need do is point, click, observe and download MSI data, where ever they deem it appropriate.

_IsolaS2_ is intended to be intuitive to use and its purpose easily discoverable
