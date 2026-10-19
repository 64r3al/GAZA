(() => {
  'use strict';

  const LANGUAGES = ['en', 'ar', 'fr', 'es', 'pt', 'de'];
  const NAMES = { en: 'English', ar: 'العربية', fr: 'Français', es: 'Español', pt: 'Português', de: 'Deutsch' };
  const RTL = new Set(['ar']);
  const normalize = (value) => String(value == null ? '' : value).replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  const rows = [
    ['Skip to content','Passer au contenu','Saltar al contenido','Ir para o conteúdo','Zum Inhalt springen'],
    ['Skip to story','Passer à l’article','Saltar al reportaje','Saltar para a reportagem','Zum Bericht springen'],
    ['Skip to archive','Passer aux archives','Saltar al archivo','Saltar para o arquivo','Zum Archiv springen'],
    ['Skip to methodology','Passer à la méthodologie','Saltar a la metodología','Saltar para a metodologia','Zur Methodik springen'],
    ['The need','Les besoins','Las necesidades','As necessidades','Der Bedarf'],
    ['2026 response','Réponse 2026','Respuesta de 2026','Resposta de 2026','Hilfsmaßnahmen 2026'],
    ['How to help','Comment aider','Cómo ayudar','Como ajudar','So können Sie helfen'],
    ['Transparency','Transparence','Transparencia','Transparência','Transparenz'],
    ['Learn & share','S’informer et partager','Aprender y compartir','Aprender e partilhar','Informieren und teilen'],
    ['A hard pill to swallow','Une vérité difficile à accepter','Una verdad difícil de aceptar','Uma verdade difícil de aceitar','Eine schwer zu akzeptierende Wahrheit'],
    ['Support children ↗','Soutenir les enfants ↗','Apoyar a la infancia ↗','Apoiar as crianças ↗','Kinder unterstützen ↗'],
    ['An independent awareness page','Une page indépendante de sensibilisation','Una página independiente de sensibilización','Uma página independente de sensibilização','Eine unabhängige Informationsseite'],
    ['For children in Gaza and beyond','Pour les enfants de Gaza et d’ailleurs','Por los niños de Gaza y de otros lugares','Pelas crianças de Gaza e de outros lugares','Für Kinder in Gaza und darüber hinaus'],
    ['A light for every child.','Une lumière pour chaque enfant.','Una luz para cada niño.','Uma luz para cada criança.','Ein Licht für jedes Kind.'],
    ['Every child deserves warmth, food, care and safety.','Chaque enfant mérite chaleur, nourriture, soins et sécurité.','Todo niño merece abrigo, alimento, atención y seguridad.','Toda criança merece abrigo, alimento, cuidados e segurança.','Jedes Kind verdient Wärme, Nahrung, Fürsorge und Sicherheit.'],
    ['Give through UNICEF ↗','Faire un don via l’UNICEF ↗','Donar a través de UNICEF ↗','Doar através da UNICEF ↗','Über UNICEF spenden ↗'],
    ['Explore ways to help','Découvrir comment aider','Descubrir cómo ayudar','Descobrir formas de ajudar','Möglichkeiten zu helfen'],
    ['Donations are completed on UNICEF’s official website. NOOR never collects money or payment details.','Les dons sont effectués sur le site officiel de l’UNICEF. NOOR ne collecte jamais d’argent ni de données de paiement.','Las donaciones se realizan en el sitio oficial de UNICEF. NOOR nunca recauda dinero ni recoge datos de pago.','Os donativos são feitos no site oficial da UNICEF. A NOOR nunca recolhe dinheiro nem dados de pagamento.','Spenden werden auf der offiziellen UNICEF-Website abgeschlossen. NOOR sammelt niemals Geld oder Zahlungsdaten.'],
    ['Beyond the headlines','Au-delà des gros titres','Más allá de los titulares','Para além das manchetes','Jenseits der Schlagzeilen'],
    ['Children need more than words.','Les enfants ont besoin de plus que des mots.','Los niños necesitan más que palabras.','As crianças precisam de mais do que palavras.','Kinder brauchen mehr als Worte.'],
    ['Families seeking assistance','Des familles à la recherche d’aide','Familias que buscan ayuda','Famílias à procura de ajuda','Familien auf der Suche nach Hilfe'],
    ['Access to water','Accès à l’eau','Acceso al agua','Acesso à água','Zugang zu Wasser'],
    ['Food support for children','Aide alimentaire pour les enfants','Apoyo alimentario para niños','Apoio alimentar para crianças','Nahrungsmittelhilfe für Kinder'],
    ['UNICEF\'S 2026 APPEAL','APPEL 2026 DE L’UNICEF','LLAMAMIENTO DE UNICEF PARA 2026','APELO DA UNICEF PARA 2026','UNICEF-APPELL 2026'],
    ['What the response is working toward.','Les objectifs de la réponse humanitaire.','Los objetivos de la respuesta humanitaria.','Os objetivos da resposta humanitária.','Ziele der humanitären Hilfe.'],
    ['People with access to safe water','Personnes ayant accès à de l’eau salubre','Personas con acceso a agua potable segura','Pessoas com acesso a água potável segura','Menschen mit Zugang zu sicherem Wasser'],
    ['Children and women accessing primary health care','Enfants et femmes ayant accès aux soins de santé primaires','Niños y mujeres con acceso a atención primaria de salud','Crianças e mulheres com acesso a cuidados de saúde primários','Kinder und Frauen mit Zugang zur medizinischen Grundversorgung'],
    ['Children accessing education','Enfants ayant accès à l’éducation','Niños con acceso a la educación','Crianças com acesso à educação','Kinder mit Zugang zu Bildung'],
    ['Practical solidarity','Solidarité concrète','Solidaridad práctica','Solidariedade prática','Praktische Solidarität'],
    ['Start with what children need.','Commençons par les besoins des enfants.','Empecemos por lo que necesitan los niños.','Comecemos pelo que as crianças precisam.','Beginnen wir mit den Bedürfnissen der Kinder.'],
    ['Safe water','Eau salubre','Agua potable segura','Água potável segura','Sicheres Wasser'],
    ['Food and nutrition','Alimentation et nutrition','Alimentación y nutrición','Alimentação e nutrição','Ernährung'],
    ['Health and protection','Santé et protection','Salud y protección','Saúde e proteção','Gesundheit und Schutz'],
    ['Clear by design','La clarté dès la conception','Claridad desde el diseño','Clareza desde a conceção','Transparenz von Anfang an'],
    ['No hidden donation flow.','Aucun parcours de don caché.','Sin procesos de donación ocultos.','Sem processos de doação ocultos.','Keine versteckten Spendenabläufe.'],
    ['Review UNICEF’s official appeal ↗','Consulter l’appel officiel de l’UNICEF ↗','Consultar el llamamiento oficial de UNICEF ↗','Consultar o apelo oficial da UNICEF ↗','Den offiziellen UNICEF-Aufruf ansehen ↗'],
    ['PRIMARY SOURCE','SOURCE PRIMAIRE','FUENTE PRIMARIA','FONTE PRIMÁRIA','PRIMÄRQUELLE'],
    ['UNICEF — Gaza response','UNICEF — réponse à Gaza','UNICEF — respuesta en Gaza','UNICEF — resposta em Gaza','UNICEF — Hilfe für Gaza'],
    ['Read official updates ↗','Lire les mises à jour officielles ↗','Leer actualizaciones oficiales ↗','Ler atualizações oficiais ↗','Offizielle Updates lesen ↗'],
    ['Learn. Verify. Share.','S’informer. Vérifier. Partager.','Infórmate. Verifica. Comparte.','Informa-te. Verifica. Partilha.','Informieren. Prüfen. Teilen.'],
    ['Let compassion travel further.','Faisons rayonner la compassion.','Hagamos llegar más lejos la solidaridad.','Façamos a solidariedade chegar mais longe.','Mitgefühl weitertragen.'],
    ['Back to the beginning ↑','Retour au début ↑','Volver al principio ↑','Voltar ao início ↑','Zurück zum Anfang ↑'],
    ['Pass it on','Faites suivre','Compártelo','Partilha','Weitergeben'],
    ['Copy page link','Copier le lien de la page','Copiar enlace de la página','Copiar ligação da página','Seitenlink kopieren'],
    ['Choose language','Choisir la langue','Elegir idioma','Escolher idioma','Sprache auswählen'],
    ['Switch language to Arabic','Passer en arabe','Cambiar al árabe','Mudar para árabe','Zu Arabisch wechseln'],
    ['Switch language to English','Passer en anglais','Cambiar al inglés','Mudar para inglês','Zu Englisch wechseln'],
    ['A light in the darkness, a hand reaching out to children.','Une lumière dans l’obscurité, une main tendue aux enfants.','Una luz en la oscuridad, una mano tendida a los niños.','Uma luz na escuridão, uma mão estendida às crianças.','Ein Licht in der Dunkelheit, eine ausgestreckte Hand für Kinder.'],
    ['Official information ↗','Informations officielles ↗','Información oficial ↗','Informações oficiais ↗','Offizielle Informationen ↗'],
    ['FIELD NOTES / 001','NOTES DE TERRAIN / 001','NOTAS DE CAMPO / 001','NOTAS DE CAMPO / 001','FELDNOTIZEN / 001'],
    ['FIELD NOTES / 002','NOTES DE TERRAIN / 002','NOTAS DE CAMPO / 002','NOTAS DE CAMPO / 002','FELDNOTIZEN / 002'],
    ['RESEARCH DESK / 003','BUREAU DE RECHERCHE / 003','MESA DE INVESTIGACIÓN / 003','NÚCLEO DE INVESTIGAÇÃO / 003','REDAKTION / RECHERCHE / 003'],
    ['THE RECORD','LES SOURCES','EL REGISTRO','O REGISTO','DAS DOKUMENTARISCHE ARCHIV'],
    ['Field notes','Notes de terrain','Notas de campo','Notas de campo','Feldnotizen'],
    ['Evidence archive','Archives documentaires','Archivo de pruebas documentales','Arquivo de evidências','Belegarchiv'],
    ['Visual evidence','Éléments visuels','Pruebas visuales','Evidências visuais','Visuelle Belege'],
    ['Legal record','Dossier juridique','Registro jurídico','Registo jurídico','Rechtsdokumentation'],
    ['Methodology','Méthodologie','Metodología','Metodologia','Methodik'],
    ['Explore the record.','Explorer les sources.','Explora el registro.','Explora o registo.','Quellen erkunden.'],
    ['INTERACTIVE SOURCE MAP / 002','CARTE INTERACTIVE DES SOURCES / 002','MAPA INTERACTIVO DE FUENTES / 002','MAPA INTERATIVO DE FONTES / 002','INTERAKTIVE QUELLENKARTE / 002'],
    ['Move through the evidence as a connected network. Every node points back to a source record; every line marks a topic or cross-reference—not a claim of guilt.','Parcourez les éléments comme un réseau interconnecté. Chaque nœud renvoie à une source ; chaque ligne indique un thème ou un renvoi, et non une accusation de culpabilité.','Recorre las pruebas como una red conectada. Cada nodo remite a un registro fuente; cada línea indica un tema o una referencia cruzada, no una acusación de culpabilidad.','Percorra as evidências como uma rede ligada. Cada nó remete para um registo de origem; cada linha indica um tema ou uma referência cruzada, não uma alegação de culpa.','Erkunden Sie die Belege als vernetztes System. Jeder Knoten verweist auf eine Quelle; jede Linie zeigt ein Thema oder einen Querverweis, keine Schuldzuweisung.'],
    ['FIND A NODE','TROUVER UN NŒUD','BUSCAR UN NODO','PROCURAR UM NÓ','KNOTEN SUCHEN'],
    ['Search names, subjects or sources','Rechercher des noms, thèmes ou sources','Buscar nombres, temas o fuentes','Pesquisar nomes, temas ou fontes','Namen, Themen oder Quellen suchen'],
    ['TOPIC LAYER','COUCHE THÉMATIQUE','CAPA TEMÁTICA','CAMADA TEMÁTICA','THEMENEBENE'],
    ['All topics','Tous les thèmes','Todos los temas','Todos os temas','Alle Themen'],
    ['Child casualties','Enfants victimes','Menores fallecidos o heridos','Crianças mortas ou feridas','Getötete und verletzte Kinder'],
    ['Civilian harm','Atteintes aux civils','Daños a la población civil','Danos a civis','Schäden an der Zivilbevölkerung'],
    ['Aid and rescue workers','Humanitaires et secouristes','Personal humanitario y de rescate','Trabalhadores humanitários e de salvamento','Hilfs- und Rettungskräfte'],
    ['Schools and shelters','Écoles et abris','Escuelas y refugios','Escolas e abrigos','Schulen und Notunterkünfte'],
    ['Access to food and aid','Accès à l’alimentation et à l’aide','Acceso a alimentos y ayuda','Acesso a alimentos e ajuda','Zugang zu Nahrung und Hilfe'],
    ['Detention / sexual violence','Détention / violences sexuelles','Detención / violencia sexual','Detenção / violência sexual','Haft / sexualisierte Gewalt'],
    ['Destruction of buildings','Destruction de bâtiments','Destrucción de edificios','Destruição de edifícios','Zerstörung von Gebäuden'],
    ['Food / nutrition','Alimentation / nutrition','Alimentación / nutrición','Alimentação / nutrição','Nahrung / Ernährung'],
    ['Displacement / unsafe shelter','Déplacement / abris dangereux','Desplazamiento / refugio inseguro','Deslocação / abrigo inseguro','Vertreibung / unsichere Unterkünfte'],
    ['FIT MAP','AJUSTER LA CARTE','AJUSTAR MAPA','AJUSTAR MAPA','KARTE EINPASSEN'],
    ['CLEAR','EFFACER','BORRAR','LIMPAR','ZURÜCKSETZEN'],
    ['TOTAL RECORDS','TOTAL DES DOSSIERS','TOTAL DE REGISTROS','TOTAL DE REGISTOS','DATENSÄTZE GESAMT'],
    ['RECORDS VISIBLE','DOSSIERS VISIBLES','REGISTROS VISIBLES','REGISTOS VISÍVEIS','SICHTBARE EINTRÄGE'],
    ['TOPIC HUBS','PÔLES THÉMATIQUES','NODOS TEMÁTICOS','NÓS TEMÁTICOS','THEMENKNOTEN'],
    ['DRAG TO PAN · SCROLL TO ZOOM · SELECT TO INSPECT','FAITES GLISSER POUR DÉPLACER · DÉFILEZ POUR ZOOMER · SÉLECTIONNEZ POUR EXAMINER','ARRASTRA PARA MOVER · DESPLAZA PARA AMPLIAR · SELECCIONA PARA EXAMINAR','ARRASTE PARA MOVER · DESLIZE PARA AMPLIAR · SELECIONE PARA EXAMINAR','ZIEHEN ZUM VERSCHIEBEN · SCROLLEN ZUM ZOOMEN · AUSWÄHLEN ZUM PRÜFEN'],
    ['Archive','Archives','Archivo','Arquivo','Archiv'],
    ['Topic hub','Pôle thématique','Nodo temático','Nó temático','Themenknoten'],
    ['Source record','Fiche source','Registro fuente','Registo de origem','Quelleneintrag'],
    ['Related by topic / source','Lié par thème / source','Relacionado por tema / fuente','Relacionado por tema / fonte','Nach Thema / Quelle verknüpft'],
    ['Select a node.','Sélectionnez un nœud.','Selecciona un nodo.','Selecione um nó.','Knoten auswählen.'],
    ['Choose a topic hub to isolate its records, or select an individual record to inspect its source links, reporting dates and scope.','Choisissez un pôle thématique pour isoler ses dossiers ou sélectionnez un dossier pour consulter ses sources, ses dates et son périmètre.','Elige un nodo temático para aislar sus registros o selecciona uno individual para consultar sus fuentes, fechas y alcance.','Escolha um nó temático para isolar os registos ou selecione um registo para consultar fontes, datas e âmbito.','Wählen Sie einen Themenknoten oder einen Eintrag, um Quellen, Berichtszeiten und Umfang zu prüfen.'],
    ['SOURCE TRAIL','PISTES DES SOURCES','RASTRO DE FUENTES','RASTO DE FONTES','QUELLENPFAD'],
    ['SOURCE METHOD ↗','MÉTHODE DES SOURCES ↗','MÉTODO DE FUENTES ↗','MÉTODO DAS FONTES ↗','QUELLENMETHODIK ↗'],
    ['A record should show its work.','Un dossier doit rendre sa méthode visible.','Un registro debe mostrar cómo se documentó.','Um registo deve mostrar como foi documentado.','Ein Eintrag sollte seine Belege offenlegen.'],
    ['What belongs in the archive?','Que faut-il inclure dans les archives ?','¿Qué debe incluirse en el archivo?','O que deve integrar o arquivo?','Was gehört ins Archiv?'],
    ['A link is not the same as independent verification.','Un lien ne vaut pas vérification indépendante.','Un enlace no equivale a una verificación independiente.','Uma ligação não equivale a verificação independente.','Ein Link ist keine unabhängige Überprüfung.'],
    ['Read each status carefully.','Lisez attentivement chaque statut.','Lee con atención cada estado.','Leia cada estado com atenção.','Lesen Sie jeden Status sorgfältig.'],
    ['See what the source actually published.','Voir ce que la source a réellement publié.','Consulta lo que publicó realmente la fuente.','Veja o que a fonte publicou de facto.','Sehen Sie, was die Quelle tatsächlich veröffentlicht hat.'],
    ['The legal record is not one single case.','Le dossier juridique ne se résume pas à une seule affaire.','El registro jurídico no es un único caso.','O registo jurídico não é um único processo.','Die Rechtslage besteht nicht aus einem einzigen Verfahren.'],
    ['Hind Rajab and the rescue response','Hind Rajab et l’intervention des secours','Hind Rajab y la respuesta de rescate','Hind Rajab e a resposta de salvamento','Hind Rajab und der Rettungseinsatz'],
    ['The Engineers’ Building strike','La frappe contre l’immeuble des ingénieurs','El ataque contra el edificio de los ingenieros','O ataque ao edifício dos engenheiros','Der Angriff auf das Ingenieursgebäude'],
    ['The Tal as-Sultan rescue convoy','Le convoi de secours de Tal as-Sultan','El convoy de rescate de Tal as-Sultan','O comboio de salvamento de Tal as-Sultan','Der Rettungskonvoi von Tal as-Sultan'],
    ['Search publishers, subjects or notes','Rechercher des éditeurs, thèmes ou notes','Buscar editores, temas o notas','Pesquisar editores, temas ou notas','Verlage, Themen oder Hinweise suchen'],
    ['Material type','Type de contenu','Tipo de material','Tipo de material','Materialtyp'],
    ['All types','Tous les types','Todos los tipos','Todos os tipos','Alle Typen'],
    ['Search the source index','Rechercher dans l’index des sources','Buscar en el índice de fuentes','Pesquisar no índice de fontes','Quellenindex durchsuchen'],
    ['No results match those filters.','Aucun résultat ne correspond à ces filtres.','Ningún resultado coincide con esos filtros.','Nenhum resultado corresponde a estes filtros.','Keine Ergebnisse entsprechen diesen Filtern.'],
    ['Content warning:','Avertissement relatif au contenu :','Aviso de contenido:','Aviso de conteúdo:','Inhaltshinweis:'],
    ['Status note:','Note sur le statut :','Nota sobre el estado:','Nota sobre o estado:','Statushinweis:'],
    ['Type of record','Type de document','Tipo de registro','Tipo de registo','Art des Eintrags'],
    ['How to read it','Comment le lire','Cómo interpretarlo','Como interpretar','So ist der Eintrag zu lesen'],
    ['SOURCE AND CONTEXT FIRST','LA SOURCE ET LE CONTEXTE D’ABORD','FUENTE Y CONTEXTO, ANTE TODO','FONTE E CONTEXTO EM PRIMEIRO LUGAR','QUELLE UND KONTEXT ZUERST'],
    ['NO AUTOPLAY','PAS DE LECTURE AUTOMATIQUE','SIN REPRODUCCIÓN AUTOMÁTICA','SEM REPRODUÇÃO AUTOMÁTICA','KEINE AUTOMATISCHE WIEDERGABE'],
    ['NO LEGAL ADVICE','AUCUN CONSEIL JURIDIQUE','NO ES ASESORAMIENTO JURÍDICO','NÃO É ACONSELHAMENTO JURÍDICO','KEINE RECHTSBERATUNG'],
    ['PRIMARY SOURCES FIRST','PRIORITÉ AUX SOURCES PRIMAIRES','PRIORIDAD A LAS FUENTES PRIMARIAS','PRIORIDADE ÀS FONTES PRIMÁRIAS','PRIMÄRQUELLEN ZUERST'],
    ['STATUS ATTRIBUTED','STATUT ATTRIBUÉ À SA SOURCE','ESTADO ATRIBUIDO A LA FUENTE','ESTADO ATRIBUÍDO À FONTE','STATUS DER QUELLE ZUGEORDNET'],
    ['INDEPENDENT PROJECT','PROJET INDÉPENDANT','PROYECTO INDEPENDIENTE','PROJETO INDEPENDENTE','UNABHÄNGIGES PROJEKT'],
    ['SOURCE-LINKED RECORDS','DOSSIERS LIÉS AUX SOURCES','REGISTROS VINCULADOS A FUENTES','REGISTOS LIGADOS ÀS FONTES','QUELLENVERKNÜPFTE EINTRÄGE'],
    ['CLAIMS LABELLED BY STATUS','ALLÉGATIONS CLASSÉES PAR STATUT','AFIRMACIONES ETIQUETADAS POR ESTADO','ALEGAÇÕES IDENTIFICADAS POR ESTADO','AUSSAGEN NACH STATUS GEKENNZEICHNET'],
    ['NO DONATIONS COLLECTED','AUCUN DON REÇU','NO SE RECAUDAN DONACIONES','NÃO SÃO RECOLHIDOS DONATIVOS','KEINE SPENDENANNAHME'],
    ['Traceable origin','Origine traçable','Origen rastreable','Origem rastreável','Nachvollziehbare Herkunft'],
    ['Clear limits','Limites clairement indiquées','Límites claros','Limites claros','Klare Grenzen'],
    ['Original footage and documents','Images et documents originaux','Imágenes y documentos originales','Imagens e documentos originais','Originalaufnahmen und Dokumente'],
    ['Investigations and journalism','Enquêtes et journalisme','Investigaciones y periodismo','Investigações e jornalismo','Recherchen und Journalismus'],
    ['Reported figures','Chiffres rapportés','Cifras publicadas','Números comunicados','Berichtete Zahlen'],
    ['Investigation or NGO finding','Conclusion d’enquête ou d’ONG','Conclusión de una investigación u ONG','Conclusão de investigação ou ONG','Ermittlungsergebnis oder NGO-Befund'],
    ['Date not listed','Date non indiquée','Fecha no indicada','Data não indicada','Datum nicht angegeben'],
    ['OPEN FULL RECORD ↓','OUVRIR LE DOSSIER COMPLET ↓','ABRIR EL REGISTRO COMPLETO ↓','ABRIR O REGISTO COMPLETO ↓','VOLLSTÄNDIGEN EINTRAG ÖFFNEN ↓'],
    ['OPEN ARCHIVE FILTERS ↓','OUVRIR LES FILTRES D’ARCHIVES ↓','ABRIR FILTROS DEL ARCHIVO ↓','ABRIR FILTROS DO ARQUIVO ↓','ARCHIVFILTER ÖFFNEN ↓'],
    ['No additional source links are attached to this topic hub.','Aucun lien source supplémentaire n’est associé à ce pôle thématique.','Este nodo temático no tiene más enlaces a fuentes.','Não existem mais ligações a fontes neste nó temático.','Mit diesem Themenknoten sind keine weiteren Quellen verknüpft.'],
    ['A curated source index—not a verdict machine.','Un index de sources sélectionnées, pas une machine à verdicts.','Un índice de fuentes seleccionadas, no una máquina de veredictos.','Um índice de fontes selecionadas — não uma máquina de veredictos.','Ein kuratierter Quellenindex, keine Urteilsmaschine.'],
    ['Search names, subjects or sources','Rechercher des noms, thèmes ou sources','Buscar nombres, temas o fuentes','Pesquisar nomes, temas ou fontes','Namen, Themen oder Quellen suchen'],
    ['Close navigation','Fermer la navigation','Cerrar navegación','Fechar navegação','Navigation schließen'],
    ['Open navigation','Ouvrir la navigation','Abrir navegación','Abrir navegação','Navigation öffnen'],
    ['Pause slideshow','Mettre le diaporama en pause','Pausar la presentación','Pausar a apresentação','Diashow pausieren'],
    ['Play slideshow','Lancer le diaporama','Reanudar la presentación','Retomar a apresentação','Diashow abspielen'],
    ['Link copied.','Lien copié.','Enlace copiado.','Ligação copiada.','Link kopiert.'],
    ['Copy was unavailable. Copy the page address from your browser.','La copie n’est pas disponible. Copiez l’adresse depuis le navigateur.','No se pudo copiar. Copia la dirección desde el navegador.','Não foi possível copiar. Copie o endereço no navegador.','Kopieren nicht verfügbar. Kopieren Sie die Seitenadresse aus dem Browser.']
  ];

  const translations = Object.fromEntries(LANGUAGES.map((lang) => [lang, new Map()]));
  rows.forEach(([english, fr, es, pt, de]) => {
    translations.en.set(normalize(english), english);
    translations.fr.set(normalize(english), fr);
    translations.es.set(normalize(english), es);
    translations.pt.set(normalize(english), pt);
    translations.de.set(normalize(english), de);
  });

  const titles = {
    en: ['NOOR — A light for every child','A hard pill to swallow | NOOR Field Notes','Gaza Evidence Archive | NOOR Field Notes','Evidence methodology | NOOR','Visual evidence index | NOOR','Legal record | NOOR','NOOR Case File'],
    ar: ['نور — ضوء لكل طفل','حقيقة يصعب تقبّلها | ملاحظات نور الميدانية','أرشيف الأدلة في غزة | ملاحظات نور الميدانية','منهجية الأدلة | نور','فهرس الأدلة المرئية | نور','السجل القانوني | نور','ملف قضية | نور'],
    fr: ['NOOR — Une lumière pour chaque enfant','Une vérité difficile à accepter | Notes de terrain NOOR','Archives documentaires de Gaza | NOOR','Méthodologie des preuves | NOOR','Index des éléments visuels | NOOR','Dossier juridique | NOOR','Dossier de cas | NOOR'],
    es: ['NOOR — Una luz para cada niño','Una verdad difícil de aceptar | Notas de campo NOOR','Archivo documental de Gaza | NOOR','Metodología de las pruebas | NOOR','Índice de pruebas visuales | NOOR','Registro jurídico | NOOR','Expediente del caso | NOOR'],
    pt: ['NOOR — Uma luz para cada criança','Uma verdade difícil de aceitar | Notas de campo NOOR','Arquivo de evidências de Gaza | NOOR','Metodologia das evidências | NOOR','Índice de evidências visuais | NOOR','Registo jurídico | NOOR','Dossier do caso | NOOR'],
    de: ['NOOR — Ein Licht für jedes Kind','Eine schwer zu akzeptierende Wahrheit | NOOR-Feldnotizen','Belegarchiv Gaza | NOOR-Feldnotizen','Methodik der Belege | NOOR','Index visueller Belege | NOOR','Rechtsdokumentation | NOOR','Falldossier | NOOR']
  };

  function pageTitleIndex() {
    const path = location.pathname.toLowerCase();
    if (path.endsWith('a-hard-pill-to-swallow.html')) return 1;
    if (path.endsWith('evidence-archive.html')) return 2;
    if (path.endsWith('methodology.html')) return 3;
    if (path.endsWith('visual-evidence.html')) return 4;
    if (path.endsWith('legal-record.html')) return 5;
    if (/case-[\w-]+\.html$/.test(path)) return 6;
    return 0;
  }

  function lookup(source, language) {
    return translations[language].get(normalize(source));
  }

  function applyLanguage(language, options = {}) {
    if (!LANGUAGES.includes(language)) language = 'en';
    const html = document.documentElement;
    const isRtl = RTL.has(language);
    html.lang = language;
    html.dir = isRtl ? 'rtl' : 'ltr';
    html.dataset.locale = language;
    html.classList.toggle('locale-rtl', isRtl);

    document.querySelectorAll('[data-en]').forEach((element) => {
      const english = element.getAttribute('data-en') || '';
      const target = language === 'en'
        ? english
        : (element.getAttribute('data-' + language) || lookup(english, language) || (language === 'ar' ? english : english));
      // These attributes are authored as plain text. Keep source markup intact for elements with nested tags.
      if (element.children.length === 0) element.textContent = target;
    });

    ['placeholder', 'alt', 'title', 'aria-label'].forEach((attribute) => {
      document.querySelectorAll('[data-en-' + attribute + ']').forEach((element) => {
        const english = element.getAttribute('data-en-' + attribute) || '';
        const target = language === 'en'
          ? english
          : (element.getAttribute('data-' + language + '-' + attribute) || lookup(english, language) || english);
        element.setAttribute(attribute, target);
      });
    });
    document.querySelectorAll('[data-en-aria]').forEach((element) => {
      const english = element.getAttribute('data-en-aria') || '';
      const target = language === 'en' ? english : (element.getAttribute('data-' + language + '-aria') || lookup(english, language) || english);
      element.setAttribute('aria-label', target);
    });

    const candidateSelector = 'h1,h2,h3,h4,h5,p,a,button,label,span,strong,em,li,dt,dd,figcaption,option,th,td,small,summary,legend';
    document.querySelectorAll(candidateSelector).forEach((element) => {
      if (element.hasAttribute('data-en') || element.hasAttribute('data-i18n-skip') || element.children.length !== 0) return;
      if (!element.hasAttribute('data-i18n-original')) element.setAttribute('data-i18n-original', element.textContent || '');
      const original = element.getAttribute('data-i18n-original') || '';
      const target = language === 'en' ? original : lookup(original, language);
      if (target) element.textContent = target;
    });

    // Translate ordinary UI attributes from their original English value while
    // keeping that source stable across repeated language changes.
    const attributeMap = [
      ['aria-label', 'data-i18n-original-aria-label'],
      ['placeholder', 'data-i18n-original-placeholder'],
      ['title', 'data-i18n-original-title'],
      ['alt', 'data-i18n-original-alt']
    ];
    attributeMap.forEach(([attribute, originalAttribute]) => {
      document.querySelectorAll('[' + attribute + ']').forEach((element) => {
        const explicitEnglish = element.getAttribute('data-en-' + attribute) || (attribute === 'aria-label' ? element.getAttribute('data-en-aria') : null);
        if (!element.hasAttribute(originalAttribute)) {
          element.setAttribute(originalAttribute, explicitEnglish != null ? explicitEnglish : element.getAttribute(attribute));
        }
        const original = element.getAttribute(originalAttribute) || '';
        const translated = language === 'en' ? original : (element.getAttribute('data-' + language + '-' + attribute) || lookup(original, language) || original);
        element.setAttribute(attribute, translated);
      });
    });

    document.querySelectorAll('[data-en-content]').forEach((element) => {
      const english = element.getAttribute('data-en-content') || '';
      const target = language === 'en' ? english : (element.getAttribute('data-' + language + '-content') || lookup(english, language) || english);
      element.setAttribute('content', target);
    });
    document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]').forEach((element) => {
      if (!element.hasAttribute('data-i18n-original-content')) element.setAttribute('data-i18n-original-content', element.getAttribute('content') || '');
      const original = element.getAttribute('data-i18n-original-content') || '';
      element.setAttribute('content', language === 'en' ? original : (lookup(original, language) || original));
    });

    const titleText = titles[language][pageTitleIndex()];
    if (titleText) document.title = titleText;
    const select = document.getElementById('noor-language-select');
    if (select && select.value !== language) select.value = language;
    document.querySelectorAll('[data-noor-language-select]').forEach((control) => {
      if (control.value !== language) control.value = language;
    });

    if (!options.skipStore) {
      try { localStorage.setItem('noor-language', language); } catch (_) { /* Storage may be disabled. */ }
    }
    document.dispatchEvent(new CustomEvent('noor:languagechange', { detail: { language, dir: html.dir, rtl: isRtl } }));
  }

  document.addEventListener('change', (event) => {
    if (event.target && event.target.matches('[data-noor-language-select]')) applyLanguage(event.target.value);
  });

  const saved = (() => {
    try { const value = localStorage.getItem('noor-language'); return LANGUAGES.includes(value) ? value : 'en'; }
    catch (_) { return 'en'; }
  })();

  window.NOORLocalization = {
    languages: LANGUAGES.slice(),
    setLanguage: applyLanguage,
    getLanguage: () => document.documentElement.lang || 'en',
    translate: (source, language = document.documentElement.lang || 'en') => lookup(source, language) || source
  };
  applyLanguage(saved, { skipStore: true });
})();