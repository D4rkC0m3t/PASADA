-- ================================================
-- SEED MATERIALS FOR INTERIOR DESIGN BUSINESS
-- Version: 1.0
-- Purpose: Populate materials catalog with common items
-- ================================================

-- Insert materials for interior design projects
-- Categories: Furniture, Lighting, Flooring, Wall Finishes, Kitchen, Bathroom, Hardware, Fabrics, Decor

-- FURNITURE CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
-- Living Room
('Modular Sofa 3-Seater', 'Furniture', 'Premium fabric modular sofa with cushions', 'pcs', 45000.00, 18, 'Urban Ladder', 5, 2, 'active'),
('Coffee Table - Wooden', 'Furniture', 'Solid wood coffee table with glass top', 'pcs', 12000.00, 18, 'Pepperfry', 8, 3, 'active'),
('TV Unit - Modern', 'Furniture', 'Wall-mounted TV unit with storage', 'pcs', 18000.00, 18, 'IKEA', 6, 2, 'active'),
('Accent Chair', 'Furniture', 'Designer accent chair with velvet upholstery', 'pcs', 15000.00, 18, 'Urban Ladder', 10, 3, 'active'),
('Bookshelf - 6ft', 'Furniture', 'Wooden bookshelf with 5 shelves', 'pcs', 8500.00, 18, 'Hometown', 12, 4, 'active'),
('Side Table', 'Furniture', 'Marble top side table with metal legs', 'pcs', 6500.00, 18, 'Pepperfry', 15, 5, 'active'),

-- Bedroom
('King Size Bed', 'Furniture', 'Upholstered king size bed with storage', 'pcs', 35000.00, 18, 'Urban Ladder', 4, 2, 'active'),
('Queen Size Bed', 'Furniture', 'Wooden queen size bed with headboard', 'pcs', 28000.00, 18, 'Pepperfry', 6, 2, 'active'),
('Wardrobe - 3 Door', 'Furniture', 'Sliding door wardrobe with mirror', 'pcs', 42000.00, 18, 'Godrej Interio', 3, 1, 'active'),
('Wardrobe - 2 Door', 'Furniture', 'Hinged door wardrobe with drawers', 'pcs', 32000.00, 18, 'Godrej Interio', 5, 2, 'active'),
('Bedside Table', 'Furniture', 'Wooden bedside table with drawer', 'pcs', 5500.00, 18, 'Hometown', 20, 5, 'active'),
('Dressing Table', 'Furniture', 'Dressing table with mirror and stool', 'pcs', 16000.00, 18, 'Urban Ladder', 8, 3, 'active'),

-- Dining
('Dining Table - 6 Seater', 'Furniture', 'Extendable dining table with chairs', 'set', 48000.00, 18, 'Pepperfry', 4, 2, 'active'),
('Dining Table - 4 Seater', 'Furniture', 'Compact dining table with chairs', 'set', 32000.00, 18, 'IKEA', 6, 2, 'active'),
('Dining Chair', 'Furniture', 'Cushioned dining chair', 'pcs', 4500.00, 18, 'Urban Ladder', 30, 10, 'active'),
('Crockery Unit', 'Furniture', 'Glass door crockery display unit', 'pcs', 22000.00, 18, 'Godrej Interio', 5, 2, 'active'),

-- Office
('Office Desk', 'Furniture', 'Executive office desk with drawers', 'pcs', 18000.00, 18, 'Featherlite', 8, 3, 'active'),
('Office Chair - Ergonomic', 'Furniture', 'High back ergonomic office chair', 'pcs', 12000.00, 18, 'Featherlite', 15, 5, 'active'),
('Filing Cabinet', 'Furniture', '4-drawer filing cabinet with lock', 'pcs', 9500.00, 18, 'Godrej Interio', 10, 3, 'active');

-- LIGHTING CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Chandelier - Crystal', 'Lighting', 'Modern crystal chandelier with LED', 'pcs', 25000.00, 18, 'Philips Lighting', 6, 2, 'active'),
('Pendant Light - Modern', 'Lighting', 'Designer pendant light for dining', 'pcs', 8500.00, 18, 'Havells', 20, 5, 'active'),
('Ceiling Light - LED', 'Lighting', 'Flush mount LED ceiling light', 'pcs', 3500.00, 18, 'Philips Lighting', 40, 10, 'active'),
('Wall Sconce', 'Lighting', 'Decorative wall mounted light', 'pcs', 4500.00, 18, 'Havells', 25, 8, 'active'),
('Floor Lamp', 'Lighting', 'Adjustable floor lamp with shade', 'pcs', 6500.00, 18, 'IKEA', 15, 5, 'active'),
('Table Lamp', 'Lighting', 'Bedside table lamp with dimmer', 'pcs', 3200.00, 18, 'Philips Lighting', 30, 10, 'active'),
('Track Light System', 'Lighting', '4-light track lighting system', 'set', 12000.00, 18, 'Havells', 10, 3, 'active'),
('LED Strip Light - 5m', 'Lighting', 'RGB LED strip with remote', 'roll', 2500.00, 18, 'Syska', 50, 15, 'active'),
('Recessed Downlight', 'Lighting', 'LED recessed ceiling light', 'pcs', 1800.00, 18, 'Philips Lighting', 100, 30, 'active');

-- FLOORING CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Vitrified Tiles - 600x600mm', 'Flooring', 'Polished vitrified floor tiles', 'sqft', 85.00, 18, 'Kajaria', 5000, 1000, 'active'),
('Ceramic Tiles - 300x300mm', 'Flooring', 'Ceramic floor tiles', 'sqft', 45.00, 18, 'Somany', 8000, 1500, 'active'),
('Marble - Italian', 'Flooring', 'Premium Italian marble flooring', 'sqft', 450.00, 18, 'R.K. Marble', 2000, 500, 'active'),
('Marble - Indian', 'Flooring', 'Indian marble flooring', 'sqft', 180.00, 18, 'R.K. Marble', 3000, 800, 'active'),
('Granite - Black', 'Flooring', 'Black granite flooring', 'sqft', 120.00, 18, 'Granite World', 4000, 1000, 'active'),
('Wooden Flooring - Laminate', 'Flooring', 'Laminate wooden flooring', 'sqft', 95.00, 18, 'Pergo', 3500, 800, 'active'),
('Wooden Flooring - Engineered', 'Flooring', 'Engineered hardwood flooring', 'sqft', 185.00, 18, 'Armstrong', 2500, 600, 'active'),
('Vinyl Flooring', 'Flooring', 'Luxury vinyl plank flooring', 'sqft', 65.00, 18, 'Tarkett', 4000, 1000, 'active'),
('Carpet Tiles', 'Flooring', 'Commercial carpet tiles', 'sqft', 55.00, 18, 'Interface', 3000, 800, 'active');

-- WALL FINISHES CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Emulsion Paint - Premium', 'Wall Finishes', 'Premium washable emulsion paint', 'ltr', 450.00, 18, 'Asian Paints', 500, 100, 'active'),
('Emulsion Paint - Standard', 'Wall Finishes', 'Standard emulsion paint', 'ltr', 280.00, 18, 'Berger Paints', 800, 150, 'active'),
('Texture Paint', 'Wall Finishes', 'Decorative texture paint', 'ltr', 650.00, 18, 'Asian Paints', 300, 80, 'active'),
('Wallpaper - Vinyl', 'Wall Finishes', 'Vinyl wallpaper with design', 'sqft', 85.00, 18, 'Nilaya', 2000, 500, 'active'),
('Wallpaper - Fabric', 'Wall Finishes', 'Premium fabric wallpaper', 'sqft', 145.00, 18, 'D''Decor', 1500, 400, 'active'),
('Wall Paneling - PVC', 'Wall Finishes', 'PVC wall panels', 'sqft', 65.00, 18, 'Duratuf', 3000, 800, 'active'),
('Wall Paneling - Wood', 'Wall Finishes', 'Wooden wall panels', 'sqft', 185.00, 18, 'Century Ply', 2000, 500, 'active'),
('Stone Cladding', 'Wall Finishes', 'Natural stone wall cladding', 'sqft', 220.00, 18, 'Stone Gallery', 1500, 400, 'active'),
('Primer - Wall', 'Wall Finishes', 'Wall primer for paint', 'ltr', 180.00, 18, 'Asian Paints', 600, 120, 'active');

-- KITCHEN CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Kitchen Cabinet - Base Unit', 'Kitchen', 'Modular base cabinet with drawers', 'pcs', 12000.00, 18, 'Godrej Interio', 20, 5, 'active'),
('Kitchen Cabinet - Wall Unit', 'Kitchen', 'Modular wall cabinet with shutters', 'pcs', 8500.00, 18, 'Godrej Interio', 25, 8, 'active'),
('Kitchen Countertop - Granite', 'Kitchen', 'Granite kitchen countertop', 'sqft', 185.00, 18, 'Granite World', 1000, 300, 'active'),
('Kitchen Countertop - Quartz', 'Kitchen', 'Engineered quartz countertop', 'sqft', 285.00, 18, 'Caesarstone', 800, 250, 'active'),
('Kitchen Sink - SS Single Bowl', 'Kitchen', 'Stainless steel single bowl sink', 'pcs', 4500.00, 18, 'Carysil', 30, 10, 'active'),
('Kitchen Sink - SS Double Bowl', 'Kitchen', 'Stainless steel double bowl sink', 'pcs', 6800.00, 18, 'Carysil', 25, 8, 'active'),
('Kitchen Faucet', 'Kitchen', 'Single lever kitchen faucet', 'pcs', 3200.00, 18, 'Jaquar', 40, 12, 'active'),
('Chimney - 60cm', 'Kitchen', 'Auto-clean kitchen chimney', 'pcs', 18000.00, 18, 'Faber', 12, 4, 'active'),
('Chimney - 90cm', 'Kitchen', 'Auto-clean kitchen chimney', 'pcs', 25000.00, 18, 'Faber', 8, 3, 'active'),
('Hob - 4 Burner Gas', 'Kitchen', '4 burner gas hob with glass top', 'pcs', 12000.00, 18, 'Glen', 15, 5, 'active'),
('Hob - 2 Burner Gas', 'Kitchen', '2 burner gas hob', 'pcs', 6500.00, 18, 'Prestige', 20, 8, 'active'),
('Backsplash Tiles', 'Kitchen', 'Ceramic backsplash tiles', 'sqft', 65.00, 18, 'Kajaria', 2000, 500, 'active'),
('Modular Drawer System', 'Kitchen', 'Soft-close drawer system', 'set', 4500.00, 18, 'Hettich', 30, 10, 'active'),
('Kitchen Handles - SS', 'Kitchen', 'Stainless steel cabinet handles', 'pcs', 180.00, 18, 'Ebco', 200, 50, 'active');

-- BATHROOM CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Wash Basin - Wall Mounted', 'Bathroom', 'Ceramic wall mounted basin', 'pcs', 4500.00, 18, 'Hindware', 25, 8, 'active'),
('Wash Basin - Pedestal', 'Bathroom', 'Pedestal wash basin', 'pcs', 5800.00, 18, 'Parryware', 20, 6, 'active'),
('Wash Basin - Counter Top', 'Bathroom', 'Designer counter top basin', 'pcs', 8500.00, 18, 'Kohler', 15, 5, 'active'),
('WC - Wall Hung', 'Bathroom', 'Wall hung water closet', 'pcs', 12000.00, 18, 'Jaquar', 18, 6, 'active'),
('WC - Floor Mounted', 'Bathroom', 'Floor mounted water closet', 'pcs', 8500.00, 18, 'Hindware', 25, 8, 'active'),
('Shower Panel', 'Bathroom', 'Thermostatic shower panel', 'pcs', 18000.00, 18, 'Jaquar', 12, 4, 'active'),
('Shower Head - Rain', 'Bathroom', 'Overhead rain shower head', 'pcs', 4500.00, 18, 'Grohe', 30, 10, 'active'),
('Bathroom Faucet', 'Bathroom', 'Single lever basin mixer', 'pcs', 3800.00, 18, 'Jaquar', 40, 12, 'active'),
('Bathroom Tiles - Wall', 'Bathroom', 'Ceramic wall tiles', 'sqft', 55.00, 18, 'Kajaria', 3000, 800, 'active'),
('Bathroom Tiles - Floor', 'Bathroom', 'Anti-slip floor tiles', 'sqft', 65.00, 18, 'Somany', 2500, 700, 'active'),
('Bathroom Mirror', 'Bathroom', 'LED backlit bathroom mirror', 'pcs', 6500.00, 18, 'Hindware', 20, 6, 'active'),
('Bathroom Vanity', 'Bathroom', 'Bathroom vanity with storage', 'pcs', 15000.00, 18, 'Kohler', 10, 3, 'active'),
('Towel Rod - SS', 'Bathroom', 'Stainless steel towel rod', 'pcs', 850.00, 18, 'Jaquar', 50, 15, 'active'),
('Soap Dispenser', 'Bathroom', 'Wall mounted soap dispenser', 'pcs', 1200.00, 18, 'Jaquar', 40, 12, 'active');

-- HARDWARE & FITTINGS CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Door Handles - Mortise', 'Hardware', 'Mortise door handle set', 'set', 1800.00, 18, 'Dorset', 100, 30, 'active'),
('Door Handles - Lever', 'Hardware', 'Lever door handle', 'set', 1200.00, 18, 'Ebco', 150, 40, 'active'),
('Door Lock - Mortise', 'Hardware', 'Mortise lock with keys', 'pcs', 2500.00, 18, 'Godrej', 80, 25, 'active'),
('Door Stopper', 'Hardware', 'Floor mounted door stopper', 'pcs', 280.00, 18, 'Ebco', 200, 50, 'active'),
('Hinges - SS', 'Hardware', 'Stainless steel door hinges', 'pair', 350.00, 18, 'Dorset', 300, 80, 'active'),
('Cabinet Hinges - Soft Close', 'Hardware', 'Soft close cabinet hinges', 'pcs', 180.00, 18, 'Hettich', 500, 150, 'active'),
('Drawer Slides - Soft Close', 'Hardware', 'Soft close drawer slides', 'pair', 650.00, 18, 'Hettich', 200, 60, 'active'),
('Window Handles', 'Hardware', 'UPVC window handles', 'pcs', 450.00, 18, 'Ebco', 150, 40, 'active'),
('Tower Bolt', 'Hardware', 'Stainless steel tower bolt', 'pcs', 280.00, 18, 'Dorset', 200, 60, 'active'),
('Aldrop', 'Hardware', 'Door aldrop with lock', 'pcs', 320.00, 18, 'Godrej', 180, 50, 'active');

-- FABRICS & SOFT FURNISHINGS CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Curtain Fabric - Silk', 'Fabrics', 'Premium silk curtain fabric', 'mtr', 850.00, 5, 'D''Decor', 500, 150, 'active'),
('Curtain Fabric - Cotton', 'Fabrics', 'Cotton curtain fabric', 'mtr', 380.00, 5, 'Portico', 800, 200, 'active'),
('Curtain Fabric - Linen', 'Fabrics', 'Linen blend curtain fabric', 'mtr', 650.00, 5, 'Fabindia', 600, 180, 'active'),
('Blackout Curtain Fabric', 'Fabrics', 'Blackout curtain material', 'mtr', 480.00, 5, 'D''Decor', 700, 200, 'active'),
('Sheer Curtain Fabric', 'Fabrics', 'Sheer voile fabric', 'mtr', 280.00, 5, 'Portico', 900, 250, 'active'),
('Upholstery Fabric - Velvet', 'Fabrics', 'Velvet upholstery fabric', 'mtr', 950.00, 5, 'D''Decor', 400, 120, 'active'),
('Upholstery Fabric - Leather', 'Fabrics', 'Faux leather upholstery', 'mtr', 1200.00, 18, 'Recron', 300, 100, 'active'),
('Cushion Covers', 'Fabrics', 'Designer cushion covers', 'pcs', 450.00, 5, 'Fabindia', 200, 60, 'active'),
('Bed Sheets - Cotton', 'Fabrics', 'Premium cotton bed sheets', 'set', 2500.00, 5, 'Portico', 100, 30, 'active'),
('Mattress Protector', 'Fabrics', 'Waterproof mattress protector', 'pcs', 1200.00, 18, 'SleepWell', 80, 25, 'active');

-- DECOR & ACCESSORIES CATEGORY
INSERT INTO materials (name, category, description, unit, unit_price, tax_percent, supplier_name, stock_quantity, min_stock_level, status) VALUES
('Wall Art - Canvas', 'Decor', 'Framed canvas wall art', 'pcs', 3500.00, 12, 'HomeTown', 50, 15, 'active'),
('Wall Clock - Designer', 'Decor', 'Designer wall clock', 'pcs', 2200.00, 18, 'Titan', 40, 12, 'active'),
('Vase - Ceramic', 'Decor', 'Decorative ceramic vase', 'pcs', 1800.00, 12, 'HomeTown', 60, 18, 'active'),
('Photo Frames', 'Decor', 'Wooden photo frames set', 'set', 1200.00, 12, 'IKEA', 80, 25, 'active'),
('Artificial Plants', 'Decor', 'Artificial decorative plants', 'pcs', 1500.00, 18, 'IKEA', 70, 20, 'active'),
('Decorative Mirrors', 'Decor', 'Decorative wall mirrors', 'pcs', 4500.00, 18, 'HomeTown', 35, 10, 'active'),
('Candle Holders', 'Decor', 'Metal candle holders set', 'set', 850.00, 12, 'IKEA', 100, 30, 'active'),
('Throw Pillows', 'Decor', 'Decorative throw pillows', 'pcs', 650.00, 5, 'Fabindia', 150, 45, 'active'),
('Area Rug - 5x7 ft', 'Decor', 'Designer area rug', 'pcs', 8500.00, 5, 'Carpet Cellar', 25, 8, 'active'),
('Table Runner', 'Decor', 'Decorative table runner', 'pcs', 850.00, 5, 'Fabindia', 80, 25, 'active');

-- Update the created_at and updated_at for all materials
UPDATE materials SET created_at = NOW(), updated_at = NOW();

-- Display summary
SELECT 
    category,
    COUNT(*) as item_count,
    MIN(unit_price) as min_price,
    MAX(unit_price) as max_price,
    AVG(unit_price)::NUMERIC(10,2) as avg_price
FROM materials
GROUP BY category
ORDER BY category;

-- Display total count
SELECT COUNT(*) as total_materials FROM materials;
