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

    ['Choose language','Choisir la langue','Elegir idioma','Escolher idioma','Sprache auswählen'],
    ['Conflict disrupts the essentials of childhood: safe water, nutritious food, medical care, protection and learning. Reliable humanitarian updates can help us understand what is needed and where support is directed.','Le conflit perturbe les besoins essentiels de l’enfance : eau potable, alimentation nutritive, soins médicaux, protection et éducation. Des informations humanitaires fiables aident à comprendre les besoins et la destination de l’aide.','El conflicto interrumpe aspectos esenciales de la infancia: agua potable, alimentos nutritivos, atención médica, protección y educación. La información humanitaria fiable ayuda a comprender las necesidades y el destino de la ayuda.','O conflito perturba necessidades essenciais da infância: água potável, alimentação nutritiva, cuidados médicos, proteção e educação. Informações humanitárias fiáveis ajudam a compreender as necessidades e o destino do apoio.','Konflikte beeinträchtigen grundlegende Bedürfnisse von Kindern: sauberes Wasser, nahrhafte Lebensmittel, medizinische Versorgung, Schutz und Bildung. Verlässliche humanitäre Updates helfen, Bedarf und Verwendung der Hilfe zu verstehen.'],
    ['Planned access to sufficient, good-quality water for drinking and household needs.','Accès prévu à une quantité suffisante d’eau de bonne qualité pour la boisson et les besoins domestiques.','Acceso previsto a agua suficiente y de buena calidad para beber y para las necesidades domésticas.','Acesso previsto a água suficiente e de boa qualidade para consumo e necessidades domésticas.','Geplanter Zugang zu ausreichendem Wasser guter Qualität zum Trinken und für den Haushalt.'],
    ['Planned access to primary health care at UNICEF-supported facilities.','Accès prévu aux soins de santé primaires dans des établissements soutenus par l’UNICEF.','Acceso previsto a atención primaria de salud en centros respaldados por UNICEF.','Acesso previsto a cuidados de saúde primários em unidades apoiadas pela UNICEF.','Geplanter Zugang zur medizinischen Grundversorgung in von UNICEF unterstützten Einrichtungen.'],
    ['Planned access to formal or non-formal education, including early learning.','Accès prévu à l’éducation formelle ou non formelle, y compris l’apprentissage préscolaire.','Acceso previsto a educación formal o no formal, incluida la educación inicial.','Acesso previsto à educação formal ou não formal, incluindo a aprendizagem inicial.','Geplanter Zugang zu formaler oder non-formaler Bildung einschließlich frühkindlichem Lernen.'],
    ['Planned prevention education on landmines and other explosive weapons.','Éducation préventive prévue sur les mines antipersonnel et autres armes explosives.','Educación preventiva prevista sobre minas terrestres y otras armas explosivas.','Educação preventiva prevista sobre minas terrestres e outras armas explosivas.','Geplante Aufklärung über Landminen und andere explosive Waffen.'],
    ['Established humanitarian organizations coordinate aid on the ground. The priorities below are broad areas of support—not promises that a particular donation will purchase a specific item.','Des organisations humanitaires établies coordonnent l’aide sur le terrain. Les priorités ci-dessous sont de grands domaines de soutien, et non la garantie qu’un don précis financera un article particulier.','Organizaciones humanitarias consolidadas coordinan la ayuda sobre el terreno. Las siguientes prioridades son ámbitos generales de apoyo, no promesas de que una donación concreta comprará un artículo determinado.','Organizações humanitárias estabelecidas coordenam a ajuda no terreno. As prioridades abaixo são áreas gerais de apoio, não promessas de que um donativo específico comprará determinado artigo.','Etablierte humanitäre Organisationen koordinieren die Hilfe vor Ort. Die folgenden Prioritäten sind allgemeine Unterstützungsbereiche und keine Zusage, dass eine bestimmte Spende einen bestimmten Gegenstand finanziert.'],
    ['Clean water, sanitation and hygiene help protect children from preventable disease.','L’eau potable, l’assainissement et l’hygiène contribuent à protéger les enfants contre les maladies évitables.','El agua limpia, el saneamiento y la higiene ayudan a proteger a los niños de enfermedades prevenibles.','Água limpa, saneamento e higiene ajudam a proteger as crianças de doenças evitáveis.','Sauberes Wasser, Sanitärversorgung und Hygiene schützen Kinder vor vermeidbaren Krankheiten.'],
    ['Food assistance and specialised nutrition support can help children and caregivers facing shortages.','L’aide alimentaire et le soutien nutritionnel spécialisé peuvent aider les enfants et les personnes qui s’en occupent face aux pénuries.','La asistencia alimentaria y el apoyo nutricional especializado pueden ayudar a niños y cuidadores que afrontan escasez.','A assistência alimentar e o apoio nutricional especializado podem ajudar crianças e cuidadores perante a escassez.','Nahrungsmittelhilfe und spezielle Ernährungsunterstützung können Kindern und Betreuungspersonen bei Engpässen helfen.'],
    ['Medical supplies, essential health services, child protection and psychosocial care all matter.','Les fournitures médicales, les services de santé essentiels, la protection de l’enfance et le soutien psychosocial sont tous importants.','Los suministros médicos, los servicios sanitarios esenciales, la protección infantil y la atención psicosocial son importantes.','Os materiais médicos, os serviços de saúde essenciais, a proteção infantil e os cuidados psicossociais são todos importantes.','Medizinische Hilfsgüter, grundlegende Gesundheitsdienste, Kinderschutz und psychosoziale Betreuung sind gleichermaßen wichtig.'],
    ['NOOR is an independent awareness page. It does not collect donations, store payment details, issue receipts or represent UNICEF. When you choose to help, you leave this site and review the details on UNICEF’s official donation page.','NOOR est une page indépendante de sensibilisation. Elle ne collecte pas de dons, ne conserve pas de données de paiement, ne délivre pas de reçus et ne représente pas l’UNICEF. Pour aider, vous quittez ce site et consultez les modalités sur la page officielle de dons de l’UNICEF.','NOOR es una página independiente de sensibilización. No recibe donaciones, almacena datos de pago, emite recibos ni representa a UNICEF. Para ayudar, se sale de este sitio y se consultan las condiciones en la página oficial de donaciones de UNICEF.','A NOOR é uma página independente de sensibilização. Não recebe donativos, não guarda dados de pagamento, não emite recibos nem representa a UNICEF. Para ajudar, sai deste site e consulta os detalhes na página oficial de donativos da UNICEF.','NOOR ist eine unabhängige Informationsseite. Sie nimmt keine Spenden entgegen, speichert keine Zahlungsdaten, stellt keine Quittungen aus und vertritt UNICEF nicht. Wenn Sie helfen möchten, verlassen Sie diese Seite und prüfen die Angaben auf der offiziellen Spendenseite von UNICEF.'],
    ['Not able to donate? You can still help by sharing official updates, directing others to primary sources, and avoiding unverified figures or images shared without context. Always check a website\'s address before entering payment information.','Vous ne pouvez pas faire de don ? Vous pouvez aider en partageant des informations officielles, en renvoyant vers les sources primaires et en évitant les chiffres ou images non vérifiés diffusés sans contexte. Vérifiez toujours l’adresse d’un site avant d’entrer vos informations de paiement.','¿No puedes donar? Puedes ayudar compartiendo actualizaciones oficiales, remitiendo a fuentes primarias y evitando cifras o imágenes no verificadas y sin contexto. Comprueba siempre la dirección web antes de introducir datos de pago.','Não pode doar? Pode ajudar partilhando atualizações oficiais, indicando fontes primárias e evitando números ou imagens não verificados e sem contexto. Confirme sempre o endereço do site antes de introduzir dados de pagamento.','Sie können nicht spenden? Sie können helfen, indem Sie offizielle Updates teilen, auf Primärquellen verweisen und unbestätigte Zahlen oder Bilder ohne Kontext vermeiden. Prüfen Sie vor der Eingabe von Zahlungsdaten stets die Website-Adresse.'],
    ['© 2026 NOOR. Independent awareness project; not affiliated with UNICEF. No donations are collected on this site.','© 2026 NOOR. Projet indépendant de sensibilisation, sans affiliation avec l’UNICEF. Aucun don n’est collecté sur ce site.','© 2026 NOOR. Proyecto independiente de sensibilización; no está afiliado a UNICEF. Este sitio no recauda donaciones.','© 2026 NOOR. Projeto independente de sensibilização; sem afiliação à UNICEF. Este site não recolhe donativos.','© 2026 NOOR. Unabhängiges Informationsprojekt, nicht mit UNICEF verbunden. Auf dieser Website werden keine Spenden gesammelt.'],
    ['RESEARCH DESK / VISUAL INDEX','BUREAU DE RECHERCHE / INDEX VISUEL','MESA DE INVESTIGACIÓN / ÍNDICE VISUAL','NÚCLEO DE INVESTIGAÇÃO / ÍNDICE VISUAL','REDAKTION / VISUELLER INDEX'],
    ['RESEARCH DESK / LEGAL INDEX','BUREAU DE RECHERCHE / INDEX JURIDIQUE','MESA DE INVESTIGACIÓN / ÍNDICE JURÍDICO','NÚCLEO DE INVESTIGAÇÃO / ÍNDICE JURÍDICO','REDAKTION / RECHTSINDEX'],
    ['RESEARCH DESK / CASE FILE','BUREAU DE RECHERCHE / DOSSIER','MESA DE INVESTIGACIÓN / EXPEDIENTE','NÚCLEO DE INVESTIGAÇÃO / DOSSIER','REDAKTION / FALDAKTE'],
    ['VISUAL MATERIAL / PUBLISHER ATTRIBUTION','DOCUMENTATION VISUELLE / ATTRIBUTION DE L’ÉDITEUR','MATERIAL VISUAL / ATRIBUCIÓN DE LA FUENTE','MATERIAL VISUAL / ATRIBUIÇÃO DA FONTE','VISUELLES MATERIAL / QUELLENANGABE'],
    ['Filter the source index.','Filtrer l’index des sources.','Filtrar el índice de fuentes.','Filtrar o índice de fontes.','Quellenindex filtern.'],
    ['Search publishers, subjects or notes','Rechercher des éditeurs, thèmes ou notes','Buscar editores, temas o notas','Pesquisar editores, temas ou notas','Verlage, Themen oder Hinweise suchen'],
    ['Search the source index','Rechercher dans l’index des sources','Buscar en el índice de fuentes','Pesquisar no índice de fontes','Quellenindex durchsuchen'],
    ['Source trail','Piste des sources','Rastro de fuentes','Rasto das fontes','Quellenpfad'],
    ['Proceedings / findings / status distinctions','Procédures / conclusions / distinction des statuts','Procedimientos / conclusiones / distinción de estados','Processos / conclusões / distinção de estados','Verfahren / Feststellungen / Statusunterschiede'],
    ['Read status precisely.','Lisez précisément le statut.','Lee el estado con precisión.','Leia o estado com precisão.','Achten Sie genau auf den Status.'],
    ['An arrest warrant is not a conviction. Provisional measures are not a final judgment on the merits. A commission’s finding should be attributed to that commission, and an NGO’s legal assessment is not a court ruling.','Un mandat d’arrêt n’est pas une condamnation. Des mesures provisoires ne constituent pas un jugement définitif au fond. Une conclusion doit être attribuée à la commission qui l’a formulée, et l’analyse juridique d’une ONG n’est pas une décision de justice.','Una orden de detención no es una condena. Las medidas provisionales no son una sentencia definitiva sobre el fondo. Las conclusiones deben atribuirse a la comisión correspondiente, y la evaluación jurídica de una ONG no es una resolución judicial.','Um mandado de detenção não é uma condenação. Medidas provisórias não são uma decisão final sobre o mérito. As conclusões devem ser atribuídas à comissão respetiva, e a avaliação jurídica de uma ONG não é uma decisão judicial.','Ein Haftbefehl ist keine Verurteilung. Vorläufige Maßnahmen sind kein abschließendes Sachurteil. Feststellungen müssen der jeweiligen Kommission zugeschrieben werden; eine rechtliche Bewertung einer NGO ist kein Gerichtsurteil.'],
    ['What the linked record supports—and where it stops.','Ce que les sources étayent — et leurs limites.','Qué respaldan las fuentes vinculadas y cuáles son sus límites.','O que as fontes ligadas sustentam — e quais são os seus limites.','Was die verknüpften Quellen belegen – und wo ihre Grenzen liegen.'],
    ['Incident date','Date de l’incident','Fecha del incidente','Data do incidente','Datum des Vorfalls'],
    ['Publication date','Date de publication','Fecha de publicación','Data de publicação','Veröffentlichungsdatum'],
    ['Primary sources','Sources primaires','Fuentes primarias','Fontes primárias','Primärquellen'],
    ['Related case files','Dossiers liés','Expedientes relacionados','Dossiers relacionados','Verknüpfte Falldossiers'],
    ['No verdict stated.','Aucun verdict indiqué.','No se indica ningún veredicto.','Não é indicado qualquer veredito.','Kein Urteil angegeben.'],
    ['NOOR is a source index, not a court, investigative authority or real-time verification service.','NOOR est un index de sources, pas un tribunal, une autorité d’enquête ni un service de vérification en temps réel.','NOOR es un índice de fuentes, no un tribunal, una autoridad investigadora ni un servicio de verificación en tiempo real.','A NOOR é um índice de fontes, não um tribunal, uma autoridade de investigação ou um serviço de verificação em tempo real.','NOOR ist ein Quellenindex, kein Gericht, keine Ermittlungsbehörde und kein Echtzeit-Verifizierungsdienst.'],
    ['EVIDENCE MAP','CARTE DES SOURCES','MAPA DE EVIDENCIAS','MAPA DE EVIDÊNCIAS','BELEGKARTE'],
    ['SOURCE RECORDS','DOSSIERS SOURCES','REGISTROS FUENTE','REGISTOS DE ORIGEM','QUELLENEINTRÄGE'],
    ['SOURCE RECORD','DOSSIER SOURCE','REGISTRO FUENTE','REGISTO DE ORIGEM','QUELLENEINTRAG'],
    ['TOPIC NODE','NŒUD THÉMATIQUE','NODO TEMÁTICO','NÓ TEMÁTICO','THEMENKNOTEN'],
    ['RECORD','DOSSIER','REGISTRO','REGISTO','EINTRAG'],
    ['RECORDS','DOSSIERS','REGISTROS','REGISTOS','EINTRÄGE'],
    ['HUMANITARIAN','HUMANITAIRE','HUMANITARIO','HUMANITÁRIO','HUMANITÄR'],
    ['REPORTED FIGURES','CHIFFRES RAPPORTÉS','CIFRAS PUBLICADAS','NÚMEROS COMUNICADOS','BERICHTETE ZAHLEN'],
    ['NGO FINDINGS','CONCLUSIONS D’ONG','CONCLUSIONES DE ONG','CONCLUSÕES DE ONG','NGO-FESTSTELLUNGEN'],
    ['INDEPENDENT ANALYSIS','ANALYSE INDÉPENDANTE','ANÁLISIS INDEPENDIENTE','ANÁLISE INDEPENDENTE','UNABHÄNGIGE ANALYSE'],
    ['PROBE','ENQUÊTE','INVESTIGACIÓN','INVESTIGAÇÃO','UNTERSUCHUNG'],
    ['UN-VERIFIED','NON VÉRIFIÉ','NO VERIFICADO','NÃO VERIFICADO','NICHT VERIFIZIERT'],

    [`Children killed and injured despite the ceasefire`,`Des enfants tués et blessés malgré le cessez-le-feu`,`Niños muertos y heridos pese al alto el fuego`,`Crianças mortas e feridas apesar do cessar-fogo`,`Getötete und verletzte Kinder trotz Waffenruhe`],
    [`UNICEF reported that more than 340 children had been reported killed since the ceasefire was announced. In the two weeks covered by its 16 October briefing, seven children were reported killed, two boys later died of earlier injuries, and at least 33 children were seriously injured. These are reported figures, not a complete case-by-case register.`,`L’UNICEF a indiqué que plus de 340 enfants auraient été tués depuis l’annonce du cessez-le-feu. Dans les deux semaines couvertes par son point du 16 octobre, sept enfants auraient été tués, deux garçons seraient décédés de blessures antérieures et au moins 33 enfants auraient été grièvement blessés. Il s’agit de chiffres rapportés, pas d’un registre exhaustif cas par cas.`,`UNICEF informó de que se había notificado la muerte de más de 340 niños desde el anuncio del alto el fuego. En las dos semanas cubiertas por su informe del 16 de octubre, se notificó la muerte de siete niños, dos chicos fallecieron después por heridas anteriores y al menos 33 niños resultaron gravemente heridos. Son cifras comunicadas, no un registro completo caso por caso.`,`A UNICEF informou que tinham sido comunicadas mais de 340 mortes de crianças desde o anúncio do cessar-fogo. Nas duas semanas abrangidas pela atualização de 16 de outubro, foram comunicadas sete mortes de crianças, dois rapazes morreram mais tarde devido a ferimentos anteriores e pelo menos 33 crianças ficaram gravemente feridas. São números reportados, não um registo completo caso a caso.`,`UNICEF berichtete, dass seit der Ankündigung der Waffenruhe mehr als 340 getötete Kinder gemeldet worden seien. In den zwei Wochen, die der Bericht vom 16. Oktober abdeckt, wurden sieben getötete Kinder gemeldet; zwei Jungen starben später an früheren Verletzungen, und mindestens 33 Kinder wurden schwer verletzt. Dies sind berichtete Zahlen, kein vollständiges Einzelfallregister.`],
    [`Food and nutrition gains remain fragile`,`Les progrès en matière d’alimentation et de nutrition restent fragiles`,`Los avances en alimentación y nutrición siguen siendo frágiles`,`Os progressos na alimentação e nutrição continuam frágeis`,`Fortschritte bei Ernährung bleiben fragil`],
    [`Reuters reported on 16 October that a June survey found only one in three children under two met minimum dietary diversity and one in eight children under five was affected by chronic malnutrition. UNICEF warned that improvements remain fragile while commercial supply deliveries are disrupted. This is a conditions report, not an incident investigation.`,`Reuters a rapporté le 16 octobre qu’une enquête menée en juin avait montré qu’un enfant de moins de deux ans sur trois seulement atteignait le seuil minimal de diversité alimentaire, et qu’un enfant de moins de cinq ans sur huit souffrait de malnutrition chronique. L’UNICEF a averti que les progrès restaient fragiles tant que les livraisons commerciales demeuraient perturbées. Il s’agit d’un rapport sur la situation, pas d’une enquête sur un incident.`,`Reuters informó el 16 de octubre de que una encuesta de junio determinó que solo uno de cada tres menores de dos años cumplía la diversidad alimentaria mínima y que uno de cada ocho menores de cinco años sufría malnutrición crónica. UNICEF advirtió que las mejoras siguen siendo frágiles mientras continúen las interrupciones de los suministros comerciales. Es un informe sobre las condiciones, no una investigación de un incidente.`,`A Reuters noticiou em 16 de outubro que um inquérito de junho concluiu que apenas uma em cada três crianças com menos de dois anos tinha a diversidade alimentar mínima e que uma em cada oito crianças com menos de cinco anos sofria de desnutrição crónica. A UNICEF alertou que as melhorias permanecem frágeis enquanto as entregas comerciais estiverem interrompidas. Trata-se de um relatório sobre as condições, não de uma investigação de incidente.`,`Reuters berichtete am 16. Oktober, eine Erhebung vom Juni habe ergeben, dass nur jedes dritte Kind unter zwei Jahren die Mindestvielfalt bei der Ernährung erreichte und jedes achte Kind unter fünf Jahren von chronischer Mangelernährung betroffen war. UNICEF warnte, dass die Verbesserungen fragil bleiben, solange kommerzielle Lieferungen gestört sind. Dies ist ein Bericht über die Lage, keine Untersuchung eines einzelnen Vorfalls.`],
    [`Unsafe shelters and flood risk before winter`,`Abris dangereux et risque d’inondation avant l’hiver`,`Refugios inseguros y riesgo de inundaciones antes del invierno`,`Abrigos inseguros e risco de inundações antes do inverno`,`Unsichere Unterkünfte und Überschwemmungsrisiko vor dem Winter`],
    [`OCHA's 2 October report described hundreds of flood-prone displacement sites and people sheltering in unsafe buildings, alongside shortages and restrictions affecting water, sanitation and shelter preparation. The figures describe humanitarian conditions across Gaza; they do not identify one attack or establish individual legal responsibility.`,`Le rapport d’OCHA du 2 octobre décrit des centaines de sites de déplacement exposés aux inondations et des personnes réfugiées dans des bâtiments dangereux, ainsi que des pénuries et restrictions touchant l’eau, l’assainissement et la préparation des abris. Ces chiffres décrivent la situation humanitaire à Gaza ; ils ne désignent pas une attaque précise et n’établissent pas de responsabilité juridique individuelle.`,`El informe de OCHA del 2 de octubre describió cientos de lugares de desplazamiento expuestos a inundaciones y personas refugiadas en edificios inseguros, junto con escasez y restricciones que afectan al agua, el saneamiento y la preparación de refugios. Las cifras describen las condiciones humanitarias en Gaza; no identifican un ataque concreto ni establecen responsabilidad jurídica individual.`,`O relatório do OCHA de 2 de outubro descreveu centenas de locais de deslocação sujeitos a inundações e pessoas abrigadas em edifícios inseguros, além de escassez e restrições que afetam a água, o saneamento e a preparação de abrigos. Os números descrevem as condições humanitárias em Gaza; não identificam um ataque específico nem estabelecem responsabilidade jurídica individual.`,`Der OCHA-Bericht vom 2. Oktober beschrieb Hunderte überschwemmungsgefährdete Vertreibungsorte und Menschen, die in unsicheren Gebäuden Schutz suchten, sowie Engpässe und Einschränkungen bei Wasser, Sanitärversorgung und der Vorbereitung von Unterkünften. Die Zahlen beschreiben die humanitäre Lage in Gaza; sie benennen keinen einzelnen Angriff und begründen keine individuelle rechtliche Verantwortung.`],
    [`Conflict-related sexual violence in detention and operations`,`Violences sexuelles liées au conflit en détention et pendant des opérations`,`Violencia sexual relacionada con el conflicto durante la detención y las operaciones`,`Violência sexual relacionada com o conflito durante a detenção e operações`,`Konfliktbezogene sexualisierte Gewalt in Haft und bei Einsätzen`],
    [`The UN Secretary-General's 2026 report described verified incidents affecting 14 men, seven women, nine boys and one girl from Gaza and the West Bank across its reporting periods. It documents several forms of sexual violence, many during detention or interrogation. The report says it makes no legal determination and that cases are not comprehensive; this archive links to the report, not to survivor-identifying material.`,`Le rapport 2026 du Secrétaire général de l’ONU décrit des incidents vérifiés concernant 14 hommes, sept femmes, neuf garçons et une fille de Gaza et de Cisjordanie au cours des périodes examinées. Il documente plusieurs formes de violences sexuelles, souvent en détention ou lors d’interrogatoires. Le rapport précise qu’il ne formule aucune conclusion juridique et que les cas ne sont pas exhaustifs ; cet index renvoie au rapport, pas à des documents permettant d’identifier les survivants.`,`El informe de 2026 del secretario general de la ONU describe incidentes verificados que afectaron a 14 hombres, siete mujeres, nueve niños y una niña de Gaza y Cisjordania durante los periodos analizados. Documenta varias formas de violencia sexual, muchas durante la detención o los interrogatorios. El informe señala que no realiza una determinación jurídica y que los casos no son exhaustivos; este archivo enlaza al informe, no a material que identifique a las personas supervivientes.`,`O relatório de 2026 do secretário-geral da ONU descreveu incidentes verificados que afetaram 14 homens, sete mulheres, nove rapazes e uma rapariga de Gaza e da Cisjordânia nos períodos abrangidos. Documenta várias formas de violência sexual, muitas durante a detenção ou interrogatórios. O relatório afirma que não faz uma determinação jurídica e que os casos não são exaustivos; este arquivo liga ao relatório, não a material que identifique sobreviventes.`,`Der Bericht des UN-Generalsekretärs von 2026 beschreibt verifizierte Vorfälle, die in den untersuchten Zeiträumen 14 Männer, sieben Frauen, neun Jungen und ein Mädchen aus Gaza und dem Westjordanland betrafen. Er dokumentiert mehrere Formen sexualisierter Gewalt, häufig während Haft oder Verhören. Der Bericht trifft keine rechtliche Feststellung und weist darauf hin, dass die Fälle nicht vollständig sind; dieses Archiv verlinkt den Bericht, nicht identifizierendes Material zu Überlebenden.`],
    [`Destruction of residential and commercial high-rise buildings`,`Destruction d’immeubles résidentiels et commerciaux de grande hauteur`,`Destrucción de edificios residenciales y comerciales de varias plantas`,`Destruição de edifícios residenciais e comerciais de vários andares`,`Zerstörung mehrstöckiger Wohn- und Geschäftsgebäude`],
    [`Amnesty International's May 2026 investigation examined at least 13 multi-storey buildings destroyed or severely damaged in Gaza City during September and October 2025. It interviewed former residents and witnesses and analysed satellite imagery and more than 25 videos. Amnesty called for the destruction to be investigated as potential war crimes; that is the organisation's assessment, not a court judgment.`,`L’enquête d’Amnesty International publiée en mai 2026 a examiné au moins 13 immeubles détruits ou gravement endommagés à Gaza en septembre et octobre 2025. L’organisation a interrogé d’anciens habitants et des témoins et analysé des images satellites ainsi que plus de 25 vidéos. Amnesty a demandé que les destructions fassent l’objet d’une enquête pour crimes de guerre potentiels ; il s’agit de son évaluation, pas d’un jugement.`,`La investigación de Amnistía Internacional de mayo de 2026 examinó al menos 13 edificios de varias plantas destruidos o gravemente dañados en Ciudad de Gaza durante septiembre y octubre de 2025. Entrevistó a antiguos residentes y testigos y analizó imágenes satelitales y más de 25 vídeos. Amnistía pidió investigar la destrucción como posibles crímenes de guerra; esa es la valoración de la organización, no una sentencia judicial.`,`A investigação da Amnistia Internacional de maio de 2026 examinou pelo menos 13 edifícios de vários andares destruídos ou gravemente danificados na Cidade de Gaza em setembro e outubro de 2025. Entrevistou antigos residentes e testemunhas e analisou imagens de satélite e mais de 25 vídeos. A Amnistia pediu que a destruição fosse investigada como possíveis crimes de guerra; esta é a avaliação da organização, não uma decisão judicial.`,`Die Untersuchung von Amnesty International vom Mai 2026 untersuchte mindestens 13 mehrstöckige Gebäude, die im September und Oktober 2025 in Gaza-Stadt zerstört oder schwer beschädigt wurden. Ehemalige Bewohner und Zeugen wurden befragt, Satellitenbilder und mehr als 25 Videos ausgewertet. Amnesty forderte, die Zerstörung als mögliche Kriegsverbrechen zu untersuchen; dies ist die Einschätzung der Organisation, kein Gerichtsurteil.`],
    [`BBC review of documented child shooting cases`,`Analyse de la BBC sur des cas documentés d’enfants blessés par balle`,`Revisión de la BBC de casos documentados de niños heridos por disparos`,`Análise da BBC de casos documentados de crianças baleadas`,`BBC-Auswertung dokumentierter Fälle, in denen Kinder erschossen wurden`],
    [`In August 2025, BBC reporting described a collection of more than 160 cases in which children were shot in Gaza, with 95 involving wounds to the head or chest in the material reviewed. This is a documented case sample from a media investigation—not a complete count of all children killed, nor a court finding about every case.`,`En août 2025, la BBC a décrit plus de 160 cas où des enfants avaient été touchés par balle à Gaza ; dans 95 cas, les blessures à la tête ou à la poitrine apparaissaient dans les éléments examinés. Il s’agit d’un échantillon de cas documentés dans une enquête journalistique, pas du décompte complet des enfants tués ni d’une conclusion judiciaire pour chaque cas.`,`En agosto de 2025, la BBC describió más de 160 casos de niños tiroteados en Gaza; en 95 de los casos, el material examinado mostraba heridas en la cabeza o el pecho. Se trata de una muestra documentada de una investigación periodística, no de un recuento completo de todos los niños muertos ni de una conclusión judicial sobre cada caso.`,`Em agosto de 2025, a BBC descreveu mais de 160 casos de crianças baleadas em Gaza; em 95 deles, o material analisado mostrava ferimentos na cabeça ou no peito. Trata-se de uma amostra de casos documentados numa investigação jornalística, não de uma contagem completa de todas as crianças mortas nem de uma decisão judicial sobre cada caso.`,`Im August 2025 berichtete die BBC über mehr als 160 Fälle, in denen Kinder in Gaza angeschossen worden waren; bei 95 Fällen zeigten die geprüften Materialien Verletzungen am Kopf oder an der Brust. Dies ist eine dokumentierte Fallstichprobe aus einer Medienrecherche, keine vollständige Zahl aller getöteten Kinder und keine gerichtliche Feststellung zu jedem Fall.`],
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