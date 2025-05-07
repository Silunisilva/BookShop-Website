import { Paper, InputBase, IconButton, Box, Slider, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useState } from 'react';

const BookSearch = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    onFilterChange({ priceRange: newValue });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 2 }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: '10px' }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={() => setShowFilters(!showFilters)}>
          <FilterListIcon />
        </IconButton>
      </Paper>

      {showFilters && (
        <Box sx={{ width: 300, p: 2, bgcolor: 'background.paper' }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
          <Typography variant="body2" color="text.secondary">
            ${priceRange[0]} - ${priceRange[1]}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BookSearch;
