// ===== LEVEL 1 - Vollständige Objektplatzierung =====

const level1 = new Level(
  // ENEMIES - Alle verfügbaren Hühner-Typen
  [
    // Normale Chickens - verteilt über das Level
    new Chicken(800, 385),   // erste normale Chicken
    new Chicken(1200, 385),  // zweite normale Chicken  
    new Chicken(1800, 385),  // dritte normale Chicken
    new Chicken(2400, 385),  // vierte normale Chicken
    
    // Small Chickens - schnellere kleine Hühner
    new ChickenSmall(1000, 385),  // erste kleine Chicken
    new ChickenSmall(1600, 385),  // zweite kleine Chicken
    new ChickenSmall(2200, 385),  // dritte kleine Chicken
    
    // Boss Chicken - am Ende des Levels
    new ChickenBoss(3000, 160),   // Boss Chicken (großer Endgegner)
  ],
  
  // CLOUDS - Mehr Wolken für bessere Atmosphäre
  [
    new Cloud(100, 50),   // Wolke links
    new Cloud(400, 80),   // Wolke mitte-links
    new Cloud(800, 60),   // Wolke mitte
    new Cloud(1200, 90),  // Wolke mitte-rechts
    new Cloud(1600, 40),  // Wolke rechts
    new Cloud(2000, 70),  // Wolke weit rechts
  ],
  
  // BACKGROUNDS - Parallax Scrolling Layer (bereits gut konfiguriert)
  [
    // Luft/Sky Layer (langsamste Bewegung)
    new Background("assets/img/background/layers/air.png", 0, 0.3),
    new Background("assets/img/background/layers/air.png", 1440, 0.3),
    
    // Dritte Schicht (Berge/Hügel im Hintergrund)
    new Background("assets/img/background/layers/thirdLayer/full.png", 0, 0.5),
    new Background("assets/img/background/layers/thirdLayer/full.png", 1440, 0.5),
    
    // Zweite Schicht (Mittlerer Bereich)
    new Background("assets/img/background/layers/secondLayer/full.png", 0, 0.7),
    new Background("assets/img/background/layers/secondLayer/full.png", 1440, 0.7),
    
    // Erste Schicht (Vordergrund - schnellste Bewegung)
    new Background("assets/img/background/layers/firstLayer/full.png", 0, 1.0),
    new Background("assets/img/background/layers/firstLayer/full.png", 1440, 1.0),
  ]
);