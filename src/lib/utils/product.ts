export function generateIntelligentDescription(
  name: string,
  category: string,
  price: number | string,
): string {
  if (!name) return "";

  const titleLower = name.toLowerCase();
  let usageText =
    "Ses caractéristiques uniques en font un choix idéal pour faciliter votre quotidien et répondre parfaitement à vos besoins.";

  if (titleLower.match(/écouteur|earbud|casque|audio|baffle|speaker/)) {
    usageText =
      "Profitez d'une qualité sonore immersive pour vos appels et votre musique. Idéal pour vos déplacements, vos séances de sport ou vos moments de détente.";
  } else if (titleLower.match(/montre|watch|smartwatch/)) {
    usageText =
      "Restez connecté, suivez vos performances sportives et gérez vos notifications au quotidien avec style et élégance directement depuis votre poignet.";
  } else if (titleLower.match(/cuisine|blender|mixeur|chopper|hachoir|robot/)) {
    usageText =
      "Simplifiez la préparation de vos repas avec une efficacité redoutable. C'est l'accessoire indispensable pour gagner du temps en cuisine.";
  } else if (titleLower.match(/beauté|cheveux|lisseur|makeup|maquillage|épilateur|tondeuse/)) {
    usageText =
      "Prenez soin de vous et sublimez votre apparence avec des résultats professionnels sans avoir à quitter le confort de votre maison.";
  } else if (titleLower.match(/voiture|auto|dashcam|led auto/)) {
    usageText =
      "Améliorez votre confort et votre sécurité sur la route avec cet équipement fiable, conçu spécialement pour s'adapter à votre véhicule.";
  } else if (titleLower.match(/nettoyage|aspirateur|clean|balai|mop/)) {
    usageText =
      "Maintenez un environnement propre et sain sans aucun effort grâce à une technologie de nettoyage performante et ergonomique.";
  } else if (titleLower.match(/bébé|jouet|kids|enfant/)) {
    usageText =
      "Offrez à vos enfants des moments de joie et de développement en toute sécurité grâce à une conception robuste, ludique et adaptée.";
  } else if (titleLower.match(/sac|bag|sacoche/)) {
    usageText =
      "Transportez toutes vos affaires en toute sécurité avec une organisation optimale. Alliez praticité et design pour toutes vos sorties.";
  } else if (titleLower.match(/vêtement|veste|robe|t-shirt|chaussure/)) {
    usageText =
      "Associez confort absolu et style tendance pour toutes vos occasions. Conçu avec des matériaux de qualité pour une durabilité maximale.";
  }

  const categoryText =
    category && category !== "Other"
      ? ` spécialement sélectionné dans notre catégorie ${category}`
      : "";
  const priceText = price ? ` Le tout pour seulement ${price} DZD.` : "";

  return `Découvrez ${name}, un produit exceptionnel${categoryText}. ${usageText}${priceText} Ne manquez pas cette opportunité, commandez dès maintenant et profitez de notre service de livraison rapide !`;
}
