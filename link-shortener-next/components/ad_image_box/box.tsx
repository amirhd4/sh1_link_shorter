import {Box} from "@mui/material";

export function BoxImageAd({}) {

//               return (
//     <Box sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', maxHeight: '60vh', mb: 3 }}>
//                     {ad.media_type === "video" ? (
//                     <Box
//                         component="video"
//                         src={ad.media_url}
//                         autoPlay
//                         muted
//                         loop
//                         playsInline
//                         controls={false}
//                         style={{ width: "100%", height: '100%', objectFit: "cover" }}
//                     />
//                     ) : ad.media_type === "image" ? (
//   <Box
//     component="img"
//     src={ad.media_url}
//     alt={ad.title}
//     sx={{
//       width: "100%",
//       height: '100%',
//       objectFit: "cover",
//       cursor: 'pointer'  // ← نمایش cursor دست
//     }}
//     onClick={async () => {
//       if (!ad || !shortCode || isSubmitting) return;
//       setIsSubmitting(true);
//       const normalizedDomainId = normalizeDomainId(domainId);
//       try {
//         await adService.registerAdView(shortCode, normalizedDomainId);
//       } catch (e) {
//         console.error("Failed to register ad view.", e);
//         // Optional: Show a user-friendly error message
//       } finally {
//         setIsSubmitting(false); // Reset submitting state
//         if (ad.target_url) window.open(ad.target_url, "_blank");
//       }
//     }}
//   />
// ) : (
//                     <Box
//                         sx={{ position: 'relative', paddingTop: '56.25%', height: 0 }} /* 16:9 Aspect Ratio */
//                         dangerouslySetInnerHTML={{ __html: ad.media_url }}
//                     />
//                     )}
//                 </Box>
//
//
// )
}